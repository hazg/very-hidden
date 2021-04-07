<script>
  import { Tooltip, InputGroupText, Button, Card, InputGroup } from 'sveltestrap'
  import { User } from '.././store/user'
  import { Form, Field } from "sveltestrap-forms-lib"
  import { _ } from 'svelte-i18n'
  import Icon from 'svelte-dynamic-iconify'
  import Select from 'svelte-select'
  import { paste } from '../components/index/functions'
  import nope from "nope-validator"
  // import searchUsers from '../components/index/search_users'
  // import Item from '../components/index/item'
  import { onMount } from 'svelte'

  let items
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
    onSubmit: (values) => {
      api.post( 'links', {...values, users: users } )
      console.log(values)
    }
  }


  function toggle(){
    expanded = !expanded
  }

  function selectedChange(e){
    users = e.detail
  }

	const optionIdentifier = 'id'
  const getOptionLabel = (option) => option.email
  const getSelectionLabel = (option) => option.email


</script>
<div class="themed">
<Card>
  <Form class="shortener-form" {...formProps}>
    <InputGroup size="lg" label={$_('link')} class="form-group-fixed-height">
      <Field
        rows=10
        name="url"
        bind:value={url}
        type={expanded ? 'textarea' : 'input'}
        id="url-input"
        placeholder={expanded ? $_('textarea: what are we hiding?') : $_('input: what are we hiding?')}  />
      <Button id="collapse-tooltip" on:click={toggle}>
        {#if expanded}
          <Icon name="carbon:row-collapse" />
        {:else}
          <Icon name="carbon:row-expand" />
        {/if}

      </Button>
      <Tooltip target={'collapse-tooltip'}>{$_('expand collapse')}</Tooltip>
      <Button id="paste-tooltip" on:click={paste}><Icon name="fa-solid:paste" /></Button>
      <Tooltip target={'paste-tooltip'}>{$_('paste')}</Tooltip>
      <Button id="submit-button" type="submit"><Icon name="el:ok-sign" /></Button>
      <Tooltip target={'submit-button'}>{$_('submit')}</Tooltip>
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
</div>
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

  /* .themed .selectContainer{
    padding: 8px;
  } */
  :global(.shortener-form small.text-danger){
    display: block;
    position: absolute;
    top: -23px;
    left: 5px;
  }
</style>

