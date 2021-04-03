<script>
  import { Button, Card, FormGroup } from 'sveltestrap'
  import { Form, Field, createForm } from "sveltestrap-forms-lib";
  import nope from "nope-validator";
  import { _ } from 'svelte-i18n'

  let url = ''
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
      console.log(values)
    }
  }

</script>

<Card>
  <Form {...formProps}>
    <FormGroup label={$_('link')} class="form-group-fixed-height">
      <Field placeholder={$_('what are we hiding?')} name="url" />
    </FormGroup>
    <Button type="submit">{$_('short')}</Button>
  </Form>
</Card>