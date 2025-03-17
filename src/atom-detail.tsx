import { Detail, ActionPanel, Action, Icon, List, useNavigation } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState, useEffect } from "react";
import { getApiUrl, getAtomUrl } from "./lib/consts/general";
import { truncateNumber, getShareValue, formatEthValue, formatUnixTimestamp } from "./lib/utils/format";
import { GET_ATOM_DETAIL_QUERY } from "./lib/queries/atoms";

// Interface for atom details
interface AtomDetail {
  id: string;
  label?: string;
  image?: string;
  emoji?: string;
  type?: string;
  block_timestamp?: string;
  creator?: {
    id: string;
    label?: string;
    image?: string;
  };
  vault?: {
    id: string;
    total_shares: string;
    position_count: string;
    current_share_price: string;
  };
  value?: {
    thing?: {
      description?: string;
      image?: string;
      name?: string;
      url?: string;
    };
    person?: {
      description?: string;
      image?: string;
      name?: string;
      url?: string;
    };
    organization?: {
      description?: string;
      image?: string;
      name?: string;
      url?: string;
    };
  };
  vault_id?: string;
}

// Interface for user positions
interface Position {
  shares: string;
}

// Props for the AtomDetail component
interface AtomDetailProps {
  atomId: string;
  address?: string;
}

export default function AtomDetail({ atomId, address }: AtomDetailProps) {
  const { push } = useNavigation();
  const apiUrl = getApiUrl();

  const { data, isLoading } = useFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: GET_ATOM_DETAIL_QUERY,
      variables: {
        atomId: parseInt(atomId, 10), // Convert string ID to numeric
        address: address || "", // Provide empty string instead of null/undefined
      },
    }),
    parseResponse: parseAtomDetailResponse,
  });

  const atom = data?.atom;
  const userPositions = data?.positions || [];

  // Calculate ETH value if vault data is available
  let ethValue = "0";
  if (atom?.vault) {
    const totalShares = BigInt(atom.vault.total_shares || 0);
    const sharePrice = BigInt(atom.vault.current_share_price || 0);
    ethValue = formatEthValue(getShareValue(totalShares, sharePrice));
  }

  // Function to navigate to another atom's detail view
  const navigateToAtom = (id: string) => {
    push(<AtomDetail atomId={id} address={address} />);
  };

  // Get value data based on atom type
  const valueData = atom?.value ? atom.value.thing || atom.value.person || atom.value.organization : null;

  // Check if user has a position in this atom
  const userPosition = userPositions.length > 0 ? userPositions[0] : null;

  // Format the creation date
  const formattedDate = formatUnixTimestamp(atom?.block_timestamp);

  // Determine value type
  let valueType = "";
  if (atom?.value?.thing) valueType = "Thing";
  else if (atom?.value?.person) valueType = "Person";
  else if (atom?.value?.organization) valueType = "Organization";

  // Generate markdown content for the detail view
  const markdown = atom
    ? `
  # ${atom.label || "Unnamed Atom"}
  
  ${atom.image ? `![Atom Image](${atom.image})` : ""}
  
  ${
    valueData
      ? `
  ## Value Information
  
  - **Type**: ${valueType}
  ${valueData.name ? `- **Name**: ${valueData.name}` : ""}
  ${valueData.description ? `- **Description**: ${valueData.description}` : ""}
  ${valueData.url ? `- **URL**: [${valueData.url}](${valueData.url})` : ""}
  ${valueData.image ? `- **Image URL**: \`${valueData.image}\`` : ""}
  `
      : ""
  }

  ## Details
  
  - **Vault ID**: \`${atom.vault_id || "N/A"}\`
  - **Type**: ${atom.type || "Unknown"}
  - **Created**: ${formattedDate}
  - **Creator**: ${atom.creator?.label || atom.creator?.id || "Unknown"}
  - **Value**: ${ethValue} ETH
  - **Positions**: ${truncateNumber(atom.vault?.position_count || "0")}
  ${userPosition ? `- **Your Position**: ${truncateNumber(userPosition.shares)} shares` : ""}

  `
    : "Loading atom details...";

  const atomUrl = getAtomUrl(atom?.vault_id || atomId);

  // Handle metadata link clicks
  // const handleCreatorClick = () => {
  //   if (atom?.creator?.id) {
  //     navigateToAtom(atom.creator.id);
  //   }
  // };

  return (
    <Detail
      markdown={markdown}
      isLoading={isLoading}
      navigationTitle={atom?.label || "Atom Details"}
      metadata={
        atom ? (
          <Detail.Metadata>
            {atom.vault_id && <Detail.Metadata.Label title="Vault ID" text={atom.vault_id} />}
            {atom.type && <Detail.Metadata.Label title="Type" text={atom.type} />}
            {atom.image && <Detail.Metadata.Link title="Image URL" text={atom.image} target={atom.image} />}
            <Detail.Metadata.Label title="Value" text={ethValue} />
            <Detail.Metadata.Label title="Positions" text={truncateNumber(atom.vault?.position_count || "0")} />

            {userPosition && (
              <Detail.Metadata.Label title="Your Position" text={truncateNumber(userPosition.shares) + " shares"} />
            )}

            {atom.creator && (
              <Detail.Metadata.TagList title="Creator">
                <Detail.Metadata.TagList.Item
                  text={atom.creator.label || atom.creator.id}
                  icon={atom.creator.image}
                  // onAction={handleCreatorClick}
                />
              </Detail.Metadata.TagList>
            )}

            {atom.block_timestamp && <Detail.Metadata.Label title="Created" text={formattedDate} />}

            {valueData && (
              <>
                <Detail.Metadata.Separator />
                <Detail.Metadata.Label title="Value Type" text={valueType} />
                {valueData.name && <Detail.Metadata.Label title="Name" text={valueData.name} />}
                {valueData.description && <Detail.Metadata.Label title="Description" text={valueData.description} />}
                {valueData.url && (
                  <Detail.Metadata.Link title="External Link" text="Visit Website" target={valueData.url} />
                )}
              </>
            )}

            <Detail.Metadata.Separator />
            <Detail.Metadata.Link title="Open in Browser" text="View on Intuition" target={atomUrl} />
          </Detail.Metadata>
        ) : null
      }
      actions={
        <ActionPanel>
          <Action.OpenInBrowser title="Open in Browser" url={atomUrl} />
          <Action.CopyToClipboard title="Copy URL" content={atomUrl} shortcut={{ modifiers: ["cmd"], key: "." }} />
          <Action.CopyToClipboard
            title="Copy ID"
            content={atomId}
            shortcut={{ modifiers: ["cmd", "shift"], key: "." }}
          />
          {valueData?.url && <Action.OpenInBrowser title="Visit Website" url={valueData.url} icon={Icon.Globe} />}
          <Action.CopyToClipboard
            title="Copy Row Cells"
            content={`https://schema.org\tThing\t${valueData?.name || ""}\t${valueData?.description || ""}\t${valueData?.image || ""}\t${valueData?.url || ""}`}
            shortcut={{ modifiers: ["cmd", "shift"], key: "," }}
          />
        </ActionPanel>
      }
    />
  );
}

// Parse the atom detail response
async function parseAtomDetailResponse(response: Response) {
  const json = await response.json();

  if (!response.ok || "message" in json) {
    throw new Error("message" in json ? json.message : response.statusText);
  }

  // Check for errors in the response
  if (json.errors) {
    console.error("GraphQL errors:", json.errors);
    throw new Error(json.errors[0]?.message || "GraphQL error occurred");
  }

  // Check if data exists
  if (!json.data) {
    console.error("No data returned from API:", json);
    return null;
  }

  return {
    atom: json.data.atom || null,
    positions: json.data.positions || [],
  };
}
