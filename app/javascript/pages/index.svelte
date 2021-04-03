<script>
  import { Card, FormGroup } from 'sveltestrap'
  import { Form, Field, Select } from "sveltestrap-forms-lib";
  import nope from "nope-validator";
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'

  var url, schema
  onMount(async () => {

    schema = nope.object().shape({
      url: nope.string()
        .url($_('should be an address'))
        .required($_('where is the link?')),
    })

  })

  const formProps = {
    initialValues:{
    },
    validate: values => schema.validate(values),
    onSubmit: async values => {
      console.log(values)
    }
  }
</script>

{url}
<Form {...formProps}>
  <FormGroup label={$_('link')} class="form-group-fixed-height"></FormGroup>
  <Field placeholder={$_('what are we hiding?')} bind:value={url} />
</Form>
<Card>Hello world!</Card>