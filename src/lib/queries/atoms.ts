import { gql } from "graphql-request";

export const GET_ATOMS_QUERY = gql`
  query GetAtoms($searchTerm: String!, $atomType: String) {
    atoms(
      where: {
        label: { _ilike: $searchTerm }
        type: { _ilike: $atomType }
      }
    ) {
      id
      image
      label
      vaultId
      vault {
        positionCount
        totalShares
        currentSharePrice
      }
    }
  }
`;
