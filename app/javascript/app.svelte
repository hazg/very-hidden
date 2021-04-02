<!-- routify:options index=1 -->
<script>
  import { User } from './store/user'
  import { Router } from '@roxi/routify'
  import { routes } from '../../.routify/routes'
  import { Navbar, NavItem, NavLink } from 'sveltestrap'
  import './stylesheets/bootstrap.css'

</script>

<Navbar>
  <NavItem>
    {#if User.isLoggedIn() }
      <NavLink href='#' on:click={() => User.signOut()}>Выход</NavLink>
    {:else}
      <NavLink href='register'>Регистрация</NavLink>
    {/if}
  </NavItem>

</Navbar>
<Router {routes} />
