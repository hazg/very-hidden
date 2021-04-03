<script>
  import { Button, Card, InputGroup } from 'sveltestrap'
  import { Form, Field, createForm } from "sveltestrap-forms-lib";
  import nope from "nope-validator";
  import { _ } from 'svelte-i18n'
  import Icon from 'svelte-dynamic-iconify'

  let url = '', input, inputEl
  // const { form, handleChange, handleSubmit } = createForm({
  let formProps = {
    initialValues: {
      url
    },
    validate: values => nope.object().shape({
      url: nope.string()
        .url($_('should be an address'))
        .required($_('where is the link?')),
    }).validate(values),
    onSubmit: (values) => {
      api.post( 'links', values )
      console.log(values)
    }
  }

  function paste(){
    navigator.clipboard.readText()
    .then(text => {
      let el = document.getElementById('url-input')
      el.value = text
      el.select()
      // formProps.validate({url:text})
      document.getElementById('submit-button').focus()
    })
  }

  function onChange(el){
    console.log(el)
  }

</script>

<Card>
  <Form class="shortener-form" {...formProps}>
    <InputGroup label={$_('link')} class="form-group-fixed-height">
      <Field on:change={onChange} id="url-input" bind:value={url} placeholder={$_('what are we hiding?')} name="url" />
      <Button on:click={paste}><Icon name="fa-solid:paste" /></Button>
      <Button id="submit-button" type="submit">{$_('short')}</Button>
    </InputGroup>

  </Form>
</Card>

<style>
  .shortener-form small.text-danger{
    display: block;
    position: absolute;
    bottom: -23px;
    left: 5px;
  }
</style>