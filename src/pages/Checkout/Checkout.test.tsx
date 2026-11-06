import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CART_ROW_COPY } from "@/components/CartRow/constants";
import { CODE_ENTRY_COPY } from "@/components/CodeEntry/constants";
import { PAY_PANEL_COPY } from "@/components/PayPanel/constants";
import { PRODUCT_LIST_COPY } from "@/components/ProductList/constants";
import Checkout from "./Checkout";
import { CHECKOUT_COPY } from "./constants";

const leche = {
  id: "leche",
  name: "Leche entera 1 L",
  code: "2000000750019",
  priceCents: 95,
  unit: "1 L",
};

const pan = {
  id: "pan",
  name: "Pan de barra",
  code: "2000000750026",
  priceCents: 60,
  unit: "1 ud",
};

const products = [leche, pan];

let failSale = false;
let holdSale: Promise<Response> | null = null;

const json = (body: unknown, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

const saleResponse = (quantity: number, priceCents: number) => {
  return {
    ticket: "1042",
    totalCents: priceCents * quantity,
    itemCount: quantity,
    paymentMethod: "efectivo",
    lines: [
      {
        code: leche.code,
        name: leche.name,
        unit: leche.unit,
        quantity,
        unitPriceCents: priceCents,
        lineTotalCents: priceCents * quantity,
      },
    ],
  };
};

const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);

  if (url.includes("/api/sales")) {
    if (holdSale) {
      return holdSale;
    }

    if (failSale) {
      return json({ error: "invalid_sale" }, 500);
    }

    const request = JSON.parse(String(init?.body)) as { lines: { quantity: number }[] };
    const quantity = request.lines.reduce((total, line) => total + line.quantity, 0);
    return json(saleResponse(quantity, leche.priceCents));
  }

  const code = new URL(url, "http://127.0.0.1").searchParams.get("code");

  if (code === "2000000750996") {
    return json({ error: "not_found" }, 404);
  }

  const product = products.find((item) => item.code === code);

  if (product) {
    return json(product);
  }

  return json({ products: [] });
});

const addCode = async (user: UserEvent, code: string) => {
  const input = screen.getByRole("combobox", { name: CODE_ENTRY_COPY.LABEL });
  await user.click(input);
  await user.clear(input);
  await user.paste(code);
  await user.click(screen.getByRole("button", { name: CODE_ENTRY_COPY.ADD }));
};

const salesCalls = () => {
  return fetchMock.mock.calls.filter((call) => String(call[0]).includes("/api/sales"));
};

describe("Checkout", () => {
  beforeEach(() => {
    failSale = false;
    holdSale = null;
    fetchMock.mockClear();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("adds a product", async () => {
    const user = userEvent.setup();
    render(<Checkout />);

    await addCode(user, leche.code);

    expect(
      await screen.findByRole("spinbutton", { name: CART_ROW_COPY.QUANTITY(leche.name) }),
    ).toHaveValue("1");
  });

  it("increments the same product", async () => {
    const user = userEvent.setup();
    render(<Checkout />);

    await addCode(user, leche.code);
    await screen.findByRole("spinbutton", { name: CART_ROW_COPY.QUANTITY(leche.name) });
    await addCode(user, leche.code);

    expect(screen.getAllByRole("spinbutton")).toHaveLength(1);
    expect(
      screen.getByRole("spinbutton", { name: CART_ROW_COPY.QUANTITY(leche.name) }),
    ).toHaveValue("2");
  });

  it("removes a product", async () => {
    const user = userEvent.setup();
    render(<Checkout />);

    await addCode(user, leche.code);
    await screen.findByRole("button", { name: CART_ROW_COPY.REMOVE(leche.name) });
    await user.click(screen.getByRole("button", { name: CART_ROW_COPY.REMOVE(leche.name) }));

    expect(
      screen.queryByRole("spinbutton", { name: CART_ROW_COPY.QUANTITY(leche.name) }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(CHECKOUT_COPY.REMOVED)).toBeInTheDocument();
  });

  it("shows the total", async () => {
    const user = userEvent.setup();
    render(<Checkout />);

    await addCode(user, leche.code);
    await screen.findByRole("spinbutton", { name: CART_ROW_COPY.QUANTITY(leche.name) });
    await addCode(user, pan.code);
    await screen.findByRole("spinbutton", { name: CART_ROW_COPY.QUANTITY(pan.name) });

    expect(screen.getByRole("region", { name: PAY_PANEL_COPY.TOTAL })).toHaveTextContent("1,55 €");
  });

  it("charges the sale", async () => {
    const user = userEvent.setup();
    render(<Checkout />);

    await addCode(user, leche.code);
    await screen.findByRole("spinbutton", { name: CART_ROW_COPY.QUANTITY(leche.name) });
    await user.click(screen.getByRole("radio", { name: CHECKOUT_COPY.METHOD_CASH }));
    await user.click(screen.getByRole("button", { name: PAY_PANEL_COPY.CHARGE }));

    expect(
      await screen.findByRole("heading", { name: CHECKOUT_COPY.COMPLETED_TITLE }),
    ).toBeInTheDocument();
    expect(screen.getByText("1042")).toBeInTheDocument();
    expect(screen.getByText(PRODUCT_LIST_COPY.EMPTY)).toBeInTheDocument();
  });

  it("keeps the cart when the sale fails", async () => {
    failSale = true;
    const user = userEvent.setup();
    render(<Checkout />);

    await addCode(user, leche.code);
    await screen.findByRole("spinbutton", { name: CART_ROW_COPY.QUANTITY(leche.name) });
    await user.click(screen.getByRole("radio", { name: CHECKOUT_COPY.METHOD_CASH }));
    await user.click(screen.getByRole("button", { name: PAY_PANEL_COPY.CHARGE }));

    expect(await screen.findByRole("alert")).toHaveTextContent(PAY_PANEL_COPY.CHARGE_ERROR);
    expect(
      screen.getByRole("spinbutton", { name: CART_ROW_COPY.QUANTITY(leche.name) }),
    ).toHaveValue("1");
    expect(screen.getByRole("button", { name: PAY_PANEL_COPY.CHARGE })).toBeEnabled();
  });

  it("sends the sale once", async () => {
    let release: (response: Response) => void = () => undefined;
    holdSale = new Promise((resolve) => {
      release = resolve;
    });
    const user = userEvent.setup();
    render(<Checkout />);

    await addCode(user, leche.code);
    await screen.findByRole("spinbutton", { name: CART_ROW_COPY.QUANTITY(leche.name) });
    await user.click(screen.getByRole("radio", { name: CHECKOUT_COPY.METHOD_CASH }));
    await user.click(screen.getByRole("button", { name: PAY_PANEL_COPY.CHARGE }));
    await user.click(screen.getByRole("button", { name: PAY_PANEL_COPY.CHARGING }));

    expect(salesCalls()).toHaveLength(1);

    release(json(saleResponse(1, leche.priceCents)));
    expect(
      await screen.findByRole("heading", { name: CHECKOUT_COPY.COMPLETED_TITLE }),
    ).toBeInTheDocument();
    expect(salesCalls()).toHaveLength(1);
  });

  it("starts a new sale", async () => {
    const user = userEvent.setup();
    render(<Checkout />);

    await addCode(user, leche.code);
    await screen.findByRole("spinbutton", { name: CART_ROW_COPY.QUANTITY(leche.name) });
    await user.click(screen.getByRole("radio", { name: CHECKOUT_COPY.METHOD_CASH }));
    await user.click(screen.getByRole("button", { name: PAY_PANEL_COPY.CHARGE }));
    await screen.findByRole("heading", { name: CHECKOUT_COPY.COMPLETED_TITLE });
    await user.click(screen.getByRole("button", { name: CHECKOUT_COPY.NEW_SALE }));

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: CHECKOUT_COPY.COMPLETED_TITLE }),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByText(PRODUCT_LIST_COPY.EMPTY)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: PAY_PANEL_COPY.TOTAL })).toHaveTextContent("0,00 €");
  });

  it("warns when the check digit is wrong", async () => {
    const user = userEvent.setup();
    render(<Checkout />);

    await addCode(user, "2000000750010");

    expect(await screen.findByText(CHECKOUT_COPY.INVALID_CODE)).toBeInTheDocument();
    expect(fetchMock.mock.calls.some((call) => String(call[0]).includes("code="))).toBe(false);
  });

  it("warns when the product is missing", async () => {
    const user = userEvent.setup();
    render(<Checkout />);

    await addCode(user, "2000000750996");

    expect(await screen.findByText(CHECKOUT_COPY.PRODUCT_NOT_FOUND)).toBeInTheDocument();
  });
});
