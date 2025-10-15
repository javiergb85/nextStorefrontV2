// src/data/providers/queries.ts

export const PRODUCT_QUERY = `
  query getProducts {
    products(first: 10) {
      edges {
        node {
          id
          title
          handle
          descriptionHtml
          tags
          vendor
          productType
          availableForSale
          createdAt
          updatedAt
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                id
                title
                sku
                availableForSale
                quantityAvailable
                selectedOptions {
                  name
                  value
                }
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const SEARCH_QUERY = `query Search($query: String!, $first: Int, $after: String) {
  search(query: $query, first: $first, after: $after) {
    edges {
      cursor
      node {
        ... on Product {
          id
          title
          handle
          featuredImage {
            url
          }
          variants(first: 1) {
            edges {
              node {
                price {
                  amount
                }
              }
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    productFilters {
      id
      label
      values {
        id
        label
        count
        input
      }
    }
    totalCount
  }
}
`;

export const PRODUCT_DETAIL_QUERY = `query getProductById($id: ID!) { product(id: $id) { id title handle descriptionHtml tags vendor productType availableForSale createdAt updatedAt images(first: 10) { edges { node { url altText } } } variants(first: 10) { edges { node { id title sku availableForSale quantityAvailable selectedOptions { name value } price { amount currencyCode } compareAtPrice { amount currencyCode } } } } } }`;


export const PRODUCT_DETAIL_HANDLE_QUERY = `query getProductDetail($handle: String!) { productByHandle(handle: $handle) { id title handle descriptionHtml tags vendor productType availableForSale createdAt updatedAt images(first: 10) { edges { node { url altText } } } variants(first: 10) { edges { node { id title sku availableForSale quantityAvailable selectedOptions { name value } price { amount currencyCode } compareAtPrice { amount currencyCode } } } } } }`

export const LOGIN_MUTATION = `mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
  customerAccessTokenCreate(input: $input) {
    customerAccessToken {
      accessToken
      expiresAt
    }
    customerUserErrors {
      field
      message
    }
  }
}`