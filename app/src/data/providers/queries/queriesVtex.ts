// src/data/providers/queriesVtex.ts

export const PRODUCT_SEARCH_QUERY = /* GraphQL */  `
  fragment ProductFragment on Product {
    cacheId
    productId
    description
    productName
    productReference
    linkText
    brand
    brandId
    link
    categories
    categoryId
    clusterHighlights { id name }
    productClusters { id name }
    categoryTree {
      cacheId
      href
      slug
      id
      name
      titleTag
      hasChildren
      metaTagDescription
      children {
        cacheId href slug id name titleTag hasChildren metaTagDescription
      }
    }
    priceRange {
      sellingPrice { highPrice lowPrice }
      listPrice { highPrice lowPrice }
    }
    specificationGroups {
      name originalName specifications { name originalName values }
    }
    skuSpecifications {
      field { name originalName }
      values { name originalName }
    }
  }

  fragment ItemFragment on SKU {
    itemId name nameComplete complementName ean
    variations { name values }
    referenceId { Key Value }
    measurementUnit unitMultiplier
    images { cacheId imageId imageLabel imageTag imageUrl imageText }
    kitItems {
      itemId amount
      product {
        brand categoryId description link linkText productId productName productReference
        properties { originalName name values }
        productClusters { id name }
        categoryTree {
          cacheId href slug id name titleTag metaTagDescription hasChildren
          children { cacheId href slug id name titleTag metaTagDescription }
        }
      }
      sku {
        itemId name nameComplete complementName measurementUnit unitMultiplier
        images { cacheId imageId imageLabel imageTag imageUrl imageText }
        sellers {
          sellerId sellerName addToCartLink sellerDefault
          commertialOffer {
            discountHighlights { name }
            teasers {
              name conditions { minimumQuantity parameters { name value } }
              effects { parameters { name value } }
            }
            Price ListPrice Tax taxPercentage spotPrice PriceWithoutDiscount RewardValue PriceValidUntil AvailableQuantity
            Installments { Value InterestRate TotalValuePlusInterestRate NumberOfInstallments Name PaymentSystemName }
          }
        }
      }
    }
    sellers {
      commertialOffer {
        teasers {
          name conditions { minimumQuantity parameters { name value } }
          effects { parameters { name value } }
        }
      }
    }
  }

  fragment SellerFragment on Seller { sellerId sellerName sellerDefault }

  fragment CommertialOfferFragment on Offer {
    discountHighlights { name }
    teasers {
      name
      conditions { minimumQuantity parameters { name value } }
      effects { parameters { name value } }
    }
    Price ListPrice Tax taxPercentage spotPrice PriceWithoutDiscount RewardValue PriceValidUntil AvailableQuantity
  }

  fragment InstallmentFragment on Installment {
    Value InterestRate TotalValuePlusInterestRate NumberOfInstallments Name PaymentSystemName
  }

  query productSearchV3(
    $queryFacets: String
    $query: String
    $map: String
    $fullText: String
    $selectedFacets: [SelectedFacetInput]
    $orderBy: String
    $from: Int
    $to: Int
    $hideUnavailableItems: Boolean = false
    $skusFilter: ItemsFilter = ALL_AVAILABLE
    $simulationBehavior: SimulationBehavior = default
    $installmentCriteria: InstallmentsCriteria = MAX_WITHOUT_INTEREST
    $productOriginVtex: Boolean = false
    $fuzzy: String
    $operator: Operator
    $searchState: String
    $excludedPaymentSystems: [String]
    $includedPaymentSystems: [String]
    $collection: String
    $priceRange: String
  ) {
    productSearch(
      map: $map query: $query fullText: $fullText selectedFacets: $selectedFacets
      orderBy: $orderBy from: $from to: $to
      hideUnavailableItems: $hideUnavailableItems
      simulationBehavior: $simulationBehavior
      productOriginVtex: $productOriginVtex
      fuzzy: $fuzzy
      operator: $operator
      searchState: $searchState
      collection: $collection
      priceRange: $priceRange
    ) @context(provider: "vtex.search-graphql") {
      products {
        ...ProductFragment
        items(filter: $skusFilter) {
          ...ItemFragment
          sellers {
            ...SellerFragment
            commertialOffer {
              ...CommertialOfferFragment
              Installments(
                criteria: $installmentCriteria
                excludedPaymentSystems: $excludedPaymentSystems
                includedPaymentSystems: $includedPaymentSystems
              ) {
                ...InstallmentFragment
              }
            }
          }
        }
        selectedProperties { key value }
      }
      recordsFiltered
    }
    facets(
      query: $queryFacets
      selectedFacets: $selectedFacets
      fullText: $fullText
    ) @context(provider: "vtex.search-graphql") {
      facets {
        name
        values {
          id quantity name key value selected range { from to }
          link linkEncoded href
        }
      }
    }
  }
`;

export const PRODUCT_DETAIL_QUERY = /* GraphQL */  `query product(
    $slug: String
    $identifier: ProductUniqueIdentifier
    $regionId: String
    $salesChannel: Int
  ) {
    product(
      slug: $slug
      identifier: $identifier
      regionId: $regionId
      salesChannel: $salesChannel
    ) @context(provider: "vtex.search-graphql") {
      cacheId
      productId
      description
      productName
      productReference
      linkText
      brand
      brandId
      link
      categoryId
      categoryTree {
        id
        cacheId
        href
        slug
        name
        titleTag
        hasChildren
        metaTagDescription
        children {
          id
          cacheId
          href
          slug
          name
          titleTag
          hasChildren
          metaTagDescription
        }
      }
      skuSpecifications {
        field {
          originalName
          name
        }
        values {
          originalName
          name
        }
      }
      clusterHighlights {
        id
        name
      }
      productClusters {
        id
        name
      }
      priceRange {
        sellingPrice {
          highPrice
          lowPrice
        }
        listPrice {
          highPrice
          lowPrice
        }
      }
      properties {
        originalName
        name
        values
      }
      specificationGroups {
        name
        originalName
        specifications {
          name
          originalName
          values
        }
      }
      items {
        itemId
        name
        nameComplete
        complementName
        ean
        sellers{
          sellerId,
          sellerName,
          addToCartLink,
          sellerDefault
        }
        kitItems {
          itemId
          amount
          product {
            brand
            categoryId
            categoryTree {
              cacheId
              href
              slug
              id
              name
              titleTag
              hasChildren
              children {
                cacheId
                href
                slug
                id
                name
                titleTag
              }
            }
            clusterHighlights {
              id
              name
            }
            productClusters {
              id
              name
            }
            description
            link
            linkText
            productId
            productName
          }
          sku {
            itemId
            name
            nameComplete
            complementName
            measurementUnit
            unitMultiplier
            images {
              cacheId
              imageId
              imageLabel
              imageTag
              imageUrl
              imageText
            }
            sellers {
              sellerId
              sellerName
              addToCartLink
              sellerDefault
              commertialOffer {
                discountHighlights {
                  name
                }
                teasers {
                  name
                  conditions {
                    minimumQuantity
                    parameters {
                      name
                      value
                    }
                  }
                  effects {
                    parameters {
                      name
                      value
                    }
                  }
                }
                Price
                ListPrice
                Tax
                taxPercentage
                spotPrice
                PriceWithoutDiscount
                RewardValue
                PriceValidUntil
                AvailableQuantity
                Installments {
                  Value
                  InterestRate
                  TotalValuePlusInterestRate
                  NumberOfInstallments
                  Name
                  PaymentSystemName
                }
              }
            }
          }
          product {
            brand
            categoryId
            description
            link
            linkText
            productId
            productName
            productReference

            properties {
              originalName
              name
              values
            }
            productClusters {
              id
              name
            }
            categoryTree {
              cacheId
              href
              slug
              id
              name
              titleTag
              metaTagDescription
              hasChildren
              children {
                cacheId
                href
                slug
                id
                name
                titleTag
                metaTagDescription
              }
            }
          }
        }
        variations {
          name
          values
        }
        measurementUnit
        unitMultiplier
        images {
          cacheId
          imageId
          imageTag
          imageUrl
        }
        sellers {
          sellerId
          sellerName
          sellerDefault
          commertialOffer {
            discountHighlights {
              name
            }
            teasers {
              name
              conditions {
                minimumQuantity
                parameters {
                  name
                  value
                }
              }
              effects {
                parameters {
                  name
                  value
                }
              }
            }
            Price
            ListPrice
            Tax
            taxPercentage
            spotPrice
            PriceWithoutDiscount
            RewardValue
            PriceValidUntil
            AvailableQuantity
            Installments {
              Value
              InterestRate
              TotalValuePlusInterestRate
              NumberOfInstallments
              Name
              PaymentSystemName
            }
          }
        }
      }
      recommendations {
        view {
          brand
          brandId
          cacheId
          categoryId
          description
          link
          linkText
          productId
          productName
          productReference
          titleTag
          metaTagDescription
          jsonSpecifications
          releaseDate
          items {
            itemId
            name
            nameComplete
            complementName
            ean
            measurementUnit
            unitMultiplier
            estimatedDateArrival
            images {
              cacheId
              imageId
              imageLabel
              imageTag
              imageUrl
              imageText
            }
            sellers {
              sellerId
              commertialOffer {
                discountHighlights {
                  name
                }
                AvailableQuantity
                Price
                ListPrice
                PriceWithoutDiscount
                teasers {
                  name
                  conditions {
                    minimumQuantity
                    parameters {
                      name
                      value
                    }
                  }
                  effects {
                    parameters {
                      name
                      value
                    }
                  }
                }
              }
            }
          }
          priceRange {
            sellingPrice {
              highPrice
              lowPrice
            }
            listPrice {
              highPrice
              lowPrice
            }
          }
        }
      }
    }
  }`


export const UPDATE_ITEMS_MUTATION = /* GraphQL */ `
  mutation updateItems(
    $orderFormId: ID
    $orderItems: [ItemInput]
    $splitItem: Boolean
  ) {
    updateItems(
      orderFormId: $orderFormId
      orderItems: $orderItems
      splitItem: $splitItem
    ) @context(provider: "vtex.checkout-graphql") {
      id
      items{
        id
        quantity
        price
        uniqueId
        name
        
      }
    }
  }
`;

