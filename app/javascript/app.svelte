<!-- routify:options index=1 -->
<script>
  import { User } from './store/user'
  import { Router } from '@roxi/routify'
  import { routes } from '../../.routify/routes'
  import { Navbar, NavItem, NavLink, Nav } from 'sveltestrap'
  import './stylesheets/bootstrap.css'


  function signOut(){
    User.signOut()
  }
</script>

<Navbar>
  <Nav>
    <NavItem>
      {#if User.isLoggedIn() }
        <NavLink href='#' on:click={signOut}>Выход</NavLink>
      {:else}
        <NavLink href='/register'>Регистрация</NavLink>
        <NavLink href='/login'>Вход</NavLink>
      {/if}
    </NavItem>
  </Nav>
</Navbar>
<Router {routes} />
