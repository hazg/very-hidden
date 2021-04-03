<script>
  import Icon from 'svelte-dynamic-iconify'
  import SveltestrapTable, { Sort } from 'sveltestrap-table'
  import { Tooltip } from 'sveltestrap'
  import { onMount } from 'svelte'

  export let data
  export let rows = []
  export let perPage = 20
  let page = 1 // first page
	// let pageIndex = 0 // first row
  // let pageSize = 10 // optional, 10 by default
  let totalItems = 0
  let sortBy = { dir: 'desc', key: 'created_at' }
  let filterBy
  export let source


  /*
    Public functions
  */

  // Turn of filters
  export function setUnfiltered(){
    filterBy = false
    loadPage(1)
  }

  // Filtering
  export function setFilterBy(column, value){
    filterBy = {
      [column]: value,
    }
    loadPage(1)
  }

  /*
    Private functions
  */

  // Set data after load
  function setData(){
    rows = data.rows
    totalItems = data.count
  }

  export async function reload(){
    loadPage(1)
  }

  // Load api data with params
  export async function loadPage(_page = 1){
    page = _page

    let params = {
      page: page,
      sort_by: {[sortBy.key]:sortBy.dir},
      items: perPage
    }

    if(filterBy){
      params = Object.assign({}, params, {
        filter_by: filterBy?filterBy:false,
      })
    }

    data = await api.get(source, params)
    setData()
  }

  // On mount
  onMount(async () => {
    await loadPage()
  });

  // Page changing
  function pageChange(event) {
    page = event.detail.page
    loadPage(event.detail.page)
  }

  // Searching
  async function onSearch(event) {
    text = event.detail.text
    page = 1
    await load(page)
  }

  // Sorting
  async function onSort(event) {
    sortBy = event.detail
    await loadPage(page)
  }

</script>

{#if data}
  <SveltestrapTable
    responsive size="sm"
    {totalItems}
    {perPage}
    bind:sortBy
    on:pageChange={pageChange}
  >
    <div slot="top">
    </div>
    <thead slot="head">
      {#if data.headers}
        <tr>
          {#each data.headers as header, i}
            <th id="api-table-header-{i}">
              {#if header.icon}
                <Icon name={header.icon} />
              {/if}
              {#if header.tooltip}
                <Tooltip target="api-table-header-{i}">{header.tooltip}</Tooltip>
              {/if}
              {#if header.name}
                <Sort key="{header.name}" on:sort={onSort} bind:sortBy>{header.title}</Sort>
              {:else if header.title}
                {header.title}
              {/if}
            </th>
          {/each}
        </tr>
      {/if}
    </thead>
    <slot name="tbody" />
  </SveltestrapTable>
{/if}

<style>
  th{
    user-select: none;
  }
</style>