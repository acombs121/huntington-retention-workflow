# The Huntington National Bank
## Schedule RCCII Part II. Loans to Small Businesses and Small Farms

**Quarter Ended:** 2026-06-30
**Updated:** 2026-07-30
*(USD, in thousands)*

> *To be reported only with the June Report of Condition.*

---

## Loans to Small Businesses

### Loans secured by nonfarm nonresidential properties in domestic offices reported in Schedule RC-C, Part I

| Original amount | Number of Loans | Amount Currently Outstanding |
| :--- | ---: | ---: |
| $100,000 or less | 1,677 | 65,694 |
| More than $100,000 through $250,000 | 3,891 | 430,838 |
| More than $250,000 through $1,000,000 | 8,373 | 2,993,062 |
| **Total** | **13,941** | **3,489,594** |

### Commercial and industrial loans to U.S. addressees in domestic offices reported in Schedule RC-C, Part I

| Original amount | Number of Loans | Amount Currently Outstanding |
| :--- | ---: | ---: |
| $100,000 or less | 106,580 | 905,254 |
| More than $100,000 through $250,000 | 23,336 | 1,392,703 |
| More than $250,000 through $1,000,000 | 32,424 | 5,456,512 |
| **Total** | **162,340** | **7,754,469** |

---

## Agricultural Loans to Small Farms

### Loans secured by farmland (including farm residential and other improvements) in domestic offices reported in Schedule RC-C, Part I

| Original amount | Number of Loans | Amount Currently Outstanding |
| :--- | ---: | ---: |
| $100,000 or less | 636 | 24,203 |
| More than $100,000 through $250,000 | 713 | 72,955 |
| More than $250,000 through $500,000 | 370 | 78,482 |

### Loans to finance agricultural production and other loans to farmers in domestic offices reported in Schedule RC-C, Part I

| Original amount | Number of Loans | Amount Currently Outstanding |
| :--- | ---: | ---: |
| $100,000 or less | 2,179 | 42,361 |
| More than $100,000 through $250,000 | 903 | 58,929 |
| More than $250,000 through $500,000 | 581 | 61,981 |

---

## Footnotes as filed

\* Report fixed rate loans and leases by remaining maturity and floating rate loans by next repricing date.

\*\* Sum of Memorandum items 2.a.(1) through 2.a.(6) plus total nonaccrual closed-end loans secured by first liens on 1-to-4 family residential properties in domestic offices included in Schedule RC-N, item 1.c.(2).

\*\*\* Sum of Memorandum items 2.b.(1) through 2.b.(6), plus total nonaccrual loans and leases from Schedule RC-N, sum of items 1 through 8, column C, minus nonaccrual closed-end loans secured by first liens on 1-to-4 family residential properties.

\*\*\*\* Exclude loans secured by real estate that are included in Schedule RC-C, Part I.

*This statement has not been reviewed or confirmed for accuracy or relevance by any member of the FFIEC.*

---

## How this schedule is used in the Book Scout model

The **nonfarm nonresidential** block above is the small-business CRE carve-out
subtracted from the 10-Q's reported CRE balance to isolate the target segment.

```
Small-business CRE (orig. <= $1M)
  =    65,694  (<= $100K)
  +   430,838  ($100K-$250K)
  + 2,993,062  ($250K-$1M)
  = $3,489,594K  ->  $3.490B   across 13,941 loans   (avg $250.3K)

TARGET_CRE_BOOK = $23.457B (10-Q reported CRE) - $3.490B = $19.967B
targetBook      = $19.967B + $13.331B (owner-occupied CRE, RC-C Part I) = $33.298B
```

These constants live in
[`frontend/src/lib/assumptions.ts`](../frontend/src/lib/assumptions.ts) as
`SMALL_BUSINESS_CRE`, `TARGET_CRE_BOOK`, and `targetBook`.

> [!CAUTION]
> **RC-C Part II defines "small business" by original loan amount (<= $1M), not by
> SBA program participation.** This schedule does **not** support any claim about
> Huntington's SBA 7(a) origination volume or ranking. Do not cite it for that.

> [!NOTE]
> **Entity scope.** This is a **HNB** (The Huntington National Bank) Call Report
> figure being netted against an **HBAN** (Huntington Bancshares Incorporated)
> 10-Q figure. The bank is the overwhelming majority of the holding company's
> commercial book, so the netting is directionally sound, but the two figures are
> not drawn from the same reporting entity. State this if challenged.
