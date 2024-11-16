import { List } from "@raycast/api";

export const ATOM_TYPES = [
  { id: "", name: "All" },
  { id: "Thing", name: "Thing" },
  { id: "Person", name: "Person" },
  { id: "Account", name: "Account" },
  { id: "Organization", name: "Organization" },
];

type AtomType = { id: string; name: string };

export default function AtomTypeDropdown(props: {
  atomTypes: AtomType[];
  onAtomTypeChange: (newValue: string) => void;
}) {
  const { atomTypes, onAtomTypeChange } = props;
  return (
    <List.Dropdown
      tooltip="Select Search Type"
      storeValue={true}
      defaultValue={atomTypes[0].id}
      onChange={(newValue) => {
        onAtomTypeChange(newValue);
      }}
    >
      <List.Dropdown.Section title="Atom Types">
        {atomTypes.map((atomType) => (
          <List.Dropdown.Item key={atomType.id} title={atomType.name} value={atomType.id} />
        ))}
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}
