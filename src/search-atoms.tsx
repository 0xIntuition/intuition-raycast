import { ActionPanel, Action, List, Image, Icon } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState } from "react";
import { formatEther } from "viem";
import { API_URL } from "./lib/consts/general";
import { GET_ATOMS_QUERY } from "./lib/queries/atoms";
import AtomTypeDropdown, { ATOM_TYPES } from "./components/atom-type-dropdown";

interface SearchResult {
  id: string;
  label?: string;
  vaultId?: string;
  image?: string;
  vault?: {
    positionCount: string;
    totalShares: string;
    currentSharePrice: string;
  };
}

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const [atomType, setAtomType] = useState<string | undefined>(undefined);
  const { data, isLoading } = useFetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: GET_ATOMS_QUERY,
      variables: {
        searchTerm: `%${searchText}%`,
        atomType: `%${atomType}%`,
      },
    }),
    parseResponse: parseFetchResponse,
  });

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarAccessory={<AtomTypeDropdown atomTypes={ATOM_TYPES} onAtomTypeChange={setAtomType} />}
      searchBarPlaceholder="Search atoms..."
      throttle
    >
      <List.Section title="Results" subtitle={data?.length + ""}>
        {data?.map((searchResult) => <SearchListItem key={searchResult.id} searchResult={searchResult} />)}
      </List.Section>
    </List>
  );
}

function SearchListItem({ searchResult }: { searchResult: SearchResult }) {
  const totalStaked =
    parseFloat(formatEther(BigInt(searchResult.vault?.totalShares || 0))) *
    parseFloat(formatEther(BigInt(searchResult.vault?.currentSharePrice || 0)));

  return (
    <List.Item
      title={searchResult.label ?? searchResult.id}
      subtitle={searchResult.vaultId}
      icon={{
        source: searchResult.image ?? "",
        mask: Image.Mask.Circle,
      }}
      accessories={[
        { icon: Icon.ArrowUp, text: `${totalStaked.toFixed(5)} ETH` },
        { icon: Icon.Person, text: `${searchResult.vault?.positionCount}` },
      ]}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser
              title="Open in Browser"
              url={`https://beta.portal.intuition.systems/app/identity/${searchResult.id}`}
            />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action.CopyToClipboard
              title="Copy URL"
              content={`https://beta.portal.intuition.systems/app/identity/${searchResult.id}`}
              shortcut={{ modifiers: ["cmd"], key: "." }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

async function parseFetchResponse(response: Response) {
  const json = await response.json();

  if (!response.ok || "message" in json) {
    throw new Error("message" in json ? json.message : response.statusText);
  }

  return json.data.atoms as SearchResult[];
}
