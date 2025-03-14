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

// Query for fetching atom details
export const GET_ATOM_DETAIL_QUERY = gql`
  query GetAtom($atomId: numeric!, $address: String) {
    atom(id: $atomId) {
      id
      label
      image
      emoji
      type
      block_timestamp
      creator {
        id
        label
        image
      }
      vault {
        id
        total_shares
        position_count
        current_share_price
      }
      value {
        thing {
          description
          image
          name
          url
        }
        person {
          image
          name
          url
          description
        }
        organization {
          image
          name
          url
          description
        }
      }
      vault_id
    }
    
    positions(where: { account_id: {_eq: $address}, vault_id: { _eq: $atomId} }, limit: 1) {
      shares
    }
  }
`;
