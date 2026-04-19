# iropke_search_results.md

# Search Results Page Definition

---

## 1. Page Role

The Search Results page helps users quickly find relevant content across the entire website.

It must:
- return results from both **static pages** and **board/database posts**
- make the search experience feel unified, even though the site is built with two different content structures
- help users discover service pages, company pages, policy pages, and editorial content from one search box
- support fast scanning and clear relevance

---

## 2. Core Positioning

### One-line Definition
A unified search results page that surfaces both static pages and database-driven content in one structured result view.

### Strategic Direction
- One search experience
- Two content sources
- Clear relevance
- Simple, fast, useful

### Search Philosophy
Users should not need to know whether content comes from a static page or a board post.  
They only need the most relevant result.

---

## 3. Layout Structure

1. Search Header
2. Search Query Summary
3. Search Result Tabs or Filters
4. Search Result List
5. Pagination or Load More
6. Empty State
7. Suggested Links or Recommended Pages

---

## 4. Section Details (English Copywriting)

---

### 4.1 Search Header

**Purpose**
Keep the search box visible so users can refine their query immediately.

**Components**
- Search input field
- Search button
- Optional clear/reset button

**Example Copy**
Search the site

**Behavior**
- The search keyword entered from the global menu search box should be passed into this page
- The same keyword should remain visible in the input field on the results page

---

### 4.2 Search Query Summary

**Purpose**
Show users what was searched and how many results were found.

**Example Copy**
Results for “AI visibility”  
12 results found

**Optional Variants**
- 1 result found
- No results found for “AI visibility”

---

### 4.3 Search Result Tabs or Filters

**Purpose**
Allow users to narrow results by content type.

**Recommended Filters**
- All
- Pages
- Posts
- Policies
- Services

**Why This Matters**
Since the site includes both static pages and board/database content, content-type filtering helps users quickly understand what kind of result they are seeing.

**Behavior**
- Default tab: All
- Filter updates visible results without changing the main query
- Result counts may be shown beside each filter

---

### 4.4 Search Result List

**Purpose**
Display all relevant search results in a unified list.

**Result Types**
1. Static Pages  
2. Board / Database Posts

**Each Result Card Should Include**
- Content type label
- Title
- Short description or excerpt
- URL or breadcrumb
- Date (for posts only, optional for static pages)
- Highlighted matched keyword, if possible

**Recommended Labels**
- Page
- Service
- Policy
- Article
- Column
- News

**Example Result Structure**
- Label: Service
- Title: SAGE™
- Excerpt: SAGE™ is an AI-era search optimization solution...
- Breadcrumb: Home / Services / SAGE™

**Important Rule**
Static pages must be indexed in the same search pool as board/database content, not handled separately outside the results view.

---

### 4.5 Pagination or Load More

**Purpose**
Handle longer result sets without overwhelming the user.

**Recommended Approach**
- Pagination if content volume is large
- Load More if the result volume is moderate and the UX should feel lighter

**Display Example**
- Previous / Next
- Page 1 of 4

---

### 4.6 Empty State

**Purpose**
Provide a useful response when no results are found.

**Example Copy**
No results found for “brand monitoring”

Try:
- checking spelling
- using fewer keywords
- searching with broader terms

**Suggested Links**
- View all services
- Visit Insights
- Go to Contact page

---

### 4.7 Suggested Links or Recommended Pages

**Purpose**
Recover user flow when search intent is unclear or results are weak.

**Recommended Content**
- Popular services
- Recent insights
- Main company pages
- Project inquiry page

**Example Title**
You may also be looking for

---

## 5. Required UI Components

- Search input field
- Search result count summary
- Filter tabs or category chips
- Unified result cards
- Content type labels
- Breadcrumb or URL display
- Pagination or Load More control
- Empty state block
- Suggested links section

---

## 6. Message Flow Summary

1. The user enters a keyword
2. The site searches across both static pages and database posts
3. Results are shown in one unified view
4. Users can filter by content type
5. Relevant pages and posts are equally discoverable
6. If no result exists, the page guides the next action

---

## 7. Search Data Structure Guidance

To support this page correctly, both content sources must be searchable.

### 7.1 Static Pages
Static pages should include searchable metadata such as:
- title
- description
- body content
- page type
- url

### 7.2 Board / Database Posts
Posts should include:
- title
- summary
- content body
- category
- date
- url

### 7.3 Unified Search Index
A unified search index is recommended so the frontend can display results in one list.

**Suggested Common Fields**
- id
- title
- excerpt
- content
- type
- category
- url
- date
- priority score

---

## 8. Search Logic Recommendations

### Keyword Matching Priority
Recommended order:
1. Exact title match
2. Partial title match
3. Body content match
4. Metadata/category match

### Ranking Suggestions
Higher priority may be given to:
- exact keyword matches
- service pages
- high-priority company pages
- recent editorial posts

### Static Page Priority
Since static pages often contain core business information, they should not be buried under newer posts by default.

A weighting rule is recommended:
- service pages: high priority
- about/company/policy pages: medium-high priority
- posts/columns/news: normal priority with recency factor

---

## 9. UX Notes

- The search box should remain visible at the top of the page
- Filters should be easy to tap on mobile
- Result cards should clearly distinguish between pages and posts
- The design should avoid making static pages feel secondary
- Keyword highlighting improves scan speed
- The entire result page should feel fast and clean, not overloaded

---

## 10. Final Definition

The Search Results page is a unified discovery layer that connects static pages and database content into one searchable experience.
