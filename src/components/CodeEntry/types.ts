export type LookupResult = "added" | "invalid" | "unknown" | "error";

export type CodeEntryProps = {
  autoFocus: boolean;
  invalid: boolean;
  onValueChange: () => void;
  onLookup: (code: string) => Promise<LookupResult>;
};
