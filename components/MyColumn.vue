<template>
    <div>
        <span v-if="values.status === statuses.merged">
          <b-badge variant="success">{{ $t('app.merged') }}</b-badge>
        </span>
        <span v-else-if="values.status === statuses.unmerged">
              <b-badge variant="warning">{{ $t('app.unmerged') }}</b-badge>
            </span>
        <span v-else-if="values.status === statuses.error">
              <b-badge variant="danger">{{ $t('app.error') }}</b-badge>
            </span>
        <span v-else="values.status === statuses.unknown">
              <b-badge variant="secondary">{{ $t('app.unknown') }}</b-badge>
            </span>
        <b-button :href="values.compareUri" variant="link" size="sm" target="_blank">{{ $t('app.compare') }}</b-button>
        <b-button v-if="values.status === statuses.unmerged" :href="values.createMRUri" variant="link" size="sm" target="_blank">{{ $t('app.merge') }}</b-button>
    </div>
</template>

<script>
  import { statuses } from '../helpers/constants';

  export default {
    props: ['values'],
    data() {
      return {
        statuses,
      };
    }
  };
</script>
