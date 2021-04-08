<script>
  import { Tooltip, InputGroupText, Button, Card, InputGroup } from 'sveltestrap'
  import { User } from '.././store/user'
  import { Form, Field } from "sveltestrap-forms-lib"
  import { _ } from 'svelte-i18n'
  import Icon from 'svelte-dynamic-iconify'
  import Select from 'svelte-select'
  import { paste } from '../components/index/functions'
  import nope from "nope-validator"
  import { SvelteToast, toast } from 'svelte-toast'
  import ApiTable from '../components/api_table'
  import { onMount } from 'svelte'

  let items, uniqueKeys, table, rows = []
  let loaded = false
  onMount( async () => {
    items = await api.get('users')
    loaded = true
  })

  let url = '', expanded = false, users

  const schema = nope.object().shape({
    url: nope.string().required($_('where is the link?'))
  })

  const formProps = {
    initialValues: {
      url
    },
    validate: (values) => schema.validate(values),
    onSubmit: async (values) => {
      uniqueKeys = await api.post( 'shortened_urls', {...values, users: users } )
      let links = uniqueKeys.map((x)=>{
        return window.location.origin+'/'+x.unique_key
      }).join("\n")

      navigator.clipboard.writeText(links)
      toast.push($_('link copied') + ' ' + links)
      table.reload()

    }
  }


  function toggle(e){
    e.preventDefault()
    expanded = !expanded
  }

  function selectedChange(e){
    users = e.detail
  }

	function linkCopy(link){
    navigator.clipboard.writeText(link)
    toast.push($_('link copied') + ' ' + link)
  }

  function urlChange(e){
    console.log(e)
  }
</script>
<div class="themed">
<Card>
  <Form class="shortener-form" {...formProps}>
    <InputGroup size="lg" label={$_('link')} class="form-group-fixed-height">
      <Field
        rows=10
        name="url"
        bind:value={url}
        on:change={urlChange}
        type={expanded ? 'textarea' : 'input'}
        id="url-input"
        placeholder={expanded ? $_('textarea: what are we hiding?') : $_('input: what are we hiding?')}  />

      <Button id="submit-button" type="submit"><Icon name="el:ok-sign" /></Button>
      <Tooltip target={'submit-button'}>{$_('submit')}</Tooltip>

      <Button id="paste-tooltip" on:click={paste}><Icon name="fa-solid:paste" /></Button>
      <Tooltip target={'paste-tooltip'}>{$_('paste')}</Tooltip>

      <Button id="collapse-tooltip" on:click={toggle}>
        {#if expanded}
          <Icon name="carbon:row-collapse" />
        {:else}
          <Icon name="carbon:row-expand" />
        {/if}

      </Button>
      <Tooltip target={'collapse-tooltip'}>{$_('expand collapse')}</Tooltip>

    </InputGroup>
    <!-- {Item}
          loadOptions={(email) => api.get('users', {email})}
          {optionIdentifier}
          {getSelectionLabel}
          {getOptionLabel} -->
    {#if User.isLoggedIn() && loaded}
      <InputGroup size="lg" label={$_('link')} class="form-group-fixed-height">
        <InputGroupText>{$_('only for users')}</InputGroupText>
        <Select
          on:select={selectedChange}
          {items}
          isMulti={true}
          placeholder={$_('select placeholder')}
          />
      </InputGroup>
      <!-- -->
    {/if}
  </Form>
</Card>

<ApiTable bind:this={table} source="shortened_urls" bind:rows>
  <thead>
    <th>{$_('original url')}</th>
    <th>{$_('click to copy')}</th>
  </thead>

  <tbody slot="tbody">
    {#each rows as row, index (row)}
      <tr {index}>
        <td>{row.url}</td>
        <td>
          <a
            on:click|preventDefault={() => (linkCopy(window.location.origin+'/'+row.unique_key))}
            href="{window.location.origin}/{row.unique_key}"
          >
            {window.location.origin}/{row.unique_key}
          </a>
        </td>
      </tr>
    {/each}
  </tbody>
</ApiTable>
</div>

<SvelteToast />

<style>
  .themed {

    --inputColor: #b1b1b1;
    --itemColor: #b1b1b1;
    --background: #222;
    --listBackground: #222;
    --itemHoverBG: #666;
    --inputPadding: 8px;
    --multiSelectPadding: 8px;
    --itemIsActiveBG: #666;
    --itemIsActiveColor: #000;
    --multiItemBG: #666;
    --multiItemColor: #000;
    --multiItemActiveBG: #666;
    --multiItemActiveColor: #000;
    --border: #515151;
    --inputFontSize: 1.25rem;
  }
  :global(.shortener-form small.text-danger){
    display: block;
    position: absolute;
    top: -23px;
    left: 5px;
  }
</style>

