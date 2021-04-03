<!-- routify:options index=1 -->
<script>
  import { User } from './store/user'
  import { Router } from '@roxi/routify'
  import { routes } from '../../.routify/routes'
  import { Navbar, NavItem, NavLink, Nav } from 'sveltestrap'
  import './stylesheets/bootstrap.css'

</script>

<Navbar>
  <Nav>
    {#if User.isLoggedIn() }
      <NavItem>
        <NavLink href='#' on:click={User.signOut}>Выход</NavLink>
      </NavItem>
    {:else}
      <NavItem><NavLink href='/register'>Регистрация</NavLink></NavItem>
      <NavItem><NavLink href='/login'>Вход</NavLink></NavItem>
    {/if}
  </Nav>
</Navbar>
<Router {routes} />
