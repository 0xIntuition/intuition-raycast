import { gql } from "graphql-request";

export const GET_ATOMS_QUERY = gql`
  query GetAtoms($searchTerm: String!, $offset: Int) {
    atoms_aggregate(
      where: {
        label: { _ilike: $searchTerm }
      }
    ) {
      aggregate {
        count
      }
    }
    atoms(
      where: {
        label: { _ilike: $searchTerm }
      }
      order_by: { vault: { total_shares: desc } }
      limit: 50
      offset: $offset
    ) {
      id
      image
      emoji
      label
      vault_id
      creator {
        id
        label
        image
      }
      block_timestamp
      vault {
        total_shares
        current_share_price
        position_count
      }
    }
  }
`;
