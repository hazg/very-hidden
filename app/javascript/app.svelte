<!-- routify:options index=1 -->
<script>
  import { User } from "./store/user";
  import { Router } from "@roxi/routify";
  import { routes } from "../../.routify/routes";

</script>

<div>
<!-- {#if User.isLoggedIn() } -->
  <Router {routes} />
<!-- {:else} -->
  <!-- <Login /> -->
<!-- {/if} -->
</div>

<style lang="scss">
  \:global{ @import 'stylesheets/bootstrap'; }
</style>