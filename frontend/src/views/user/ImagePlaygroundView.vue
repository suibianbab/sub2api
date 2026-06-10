<template>
  <AppLayout>
    <div class="image-playground-layout">
      <div class="card flex-1 min-h-0 flex flex-col overflow-hidden">
        <!-- Loading state -->
        <div v-if="loading" class="flex h-full items-center justify-center py-12">
          <div class="text-center">
            <div
              class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"
            ></div>
            <p class="text-sm text-gray-500 dark:text-dark-400">
              {{ t('imagePlayground.loading') }}
            </p>
          </div>
        </div>

        <!-- No API Key state -->
        <div
          v-else-if="!hasApiKey"
          class="flex h-full items-center justify-center p-10 text-center"
        >
          <div class="max-w-md">
            <div
              class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-dark-700"
            >
              <Icon name="key" size="lg" class="text-gray-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('imagePlayground.noApiKey') }}
            </h3>
            <p class="mt-2 text-sm text-gray-500 dark:text-dark-400">
              {{ t('imagePlayground.noApiKeyDesc') }}
            </p>
            <router-link
              to="/keys"
              class="btn btn-primary btn-sm mt-4 inline-flex items-center"
            >
              <Icon name="plus" size="sm" class="mr-1.5" />
              {{ t('imagePlayground.createKey') }}
            </router-link>
          </div>
        </div>

        <!-- Error state -->
        <div
          v-else-if="!playgroundUrl"
          class="flex h-full items-center justify-center p-10 text-center"
        >
          <div class="max-w-md">
            <div
              class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-dark-700"
            >
              <Icon name="exclamationCircle" size="lg" class="text-gray-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('imagePlayground.error') }}
            </h3>
            <p class="mt-2 text-sm text-gray-500 dark:text-dark-400">
              {{ t('imagePlayground.errorDesc') }}
            </p>
            <button
              class="btn btn-secondary btn-sm mt-4 inline-flex items-center"
              @click="loadData"
            >
              {{ t('imagePlayground.retry') }}
            </button>
          </div>
        </div>

        <!-- Main content: toolbar + iframe -->
        <template v-else>
          <!-- Toolbar: group & key selectors -->
          <div
            class="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-4 py-2 dark:border-dark-600 dark:bg-dark-800"
          >
            <!-- Group selector -->
            <div class="flex items-center gap-2">
              <label
                class="shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {{ t('imagePlayground.group') }}
              </label>
              <Select
                v-model="selectedGroupId"
                :options="groupOptions"
                :searchable="'auto'"
                class="w-48"
                @update:model-value="onGroupChange"
              >
                <template #selected="{ option }">
                  <GroupBadge
                    v-if="option"
                    :name="(option as any).label"
                    :platform="(option as any).platform"
                    :subscription-type="(option as any).subscriptionType"
                    :rate-multiplier="(option as any).rate"
                    :show-rate="false"
                  />
                </template>
                <template #option="{ option, selected }">
                  <GroupOptionItem
                    :name="(option as any).label"
                    :platform="(option as any).platform"
                    :subscription-type="(option as any).subscriptionType"
                    :rate-multiplier="(option as any).rate"
                    :description="(option as any).description"
                    :selected="selected"
                    :show-rate="false"
                  />
                </template>
              </Select>
            </div>

            <!-- Key selector -->
            <div class="flex items-center gap-2">
              <label
                class="shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {{ t('imagePlayground.apiKey') }}
              </label>
              <Select
                v-model="selectedKeyId"
                :options="keyOptions"
                :searchable="false"
                class="w-52"
                @update:model-value="onKeyChange"
              >
                <template #selected="{ option }">
                  <span class="truncate text-sm">{{ (option as any).label }}</span>
                </template>
                <template #option="{ option, selected }">
                  <div class="flex min-w-0 items-center justify-between gap-2">
                    <span class="truncate text-sm">{{ (option as any).label }}</span>
                    <svg
                      v-if="selected"
                      class="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </template>
              </Select>
            </div>
          </div>

          <!-- Iframe embed -->
          <div class="custom-embed-shell flex-1 min-h-0">
            <iframe
              ref="playgroundFrame"
              :src="iframeSrc"
              class="custom-embed-frame"
              allow="clipboard-write"
              allowfullscreen
            ></iframe>
          </div>
        </template>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores'
import AppLayout from '@/components/layout/AppLayout.vue'
import Icon from '@/components/icons/Icon.vue'
import Select from '@/components/common/Select.vue'
import GroupBadge from '@/components/common/GroupBadge.vue'
import GroupOptionItem from '@/components/common/GroupOptionItem.vue'
import { keysAPI } from '@/api/keys'
import { userGroupsAPI } from '@/api/groups'
import type { ApiKey, Group } from '@/types'

const { t } = useI18n()
const appStore = useAppStore()

const STORAGE_KEY = 'image-playground-selection'

const loading = ref(true)
const apiKey = ref<string>('')
const hasApiKey = ref(false)
const playgroundFrame = ref<HTMLIFrameElement | null>(null)

// Selection state
const groups = ref<Group[]>([])
const activeKeys = ref<ApiKey[]>([])
const selectedGroupId = ref<number | null>(null)
const selectedKeyId = ref<number | null>(null)

/**
 * The GPT Image Playground URL.
 * Reads from public settings (image_playground_url) first,
 * falls back to deriving from the current window location.
 */
const playgroundUrl = computed(() => {
  const settingsUrl = appStore.cachedPublicSettings?.image_playground_url
  if (settingsUrl) return settingsUrl
  // Default: assume Playground is deployed alongside Sub2API on port 8081
  const { protocol, hostname } = window.location
  return `${protocol}//${hostname}:8081`
})

/**
 * The Sub2API API base URL for the Playground to call.
 * Uses the direct API endpoint (api.keys2api.com) to bypass Cloudflare
 * and avoid timeouts for long-running 2K image generation requests.
 */
const apiBaseUrl = computed(() => {
  return 'https://api.keys2api.com/v1'
})

/**
 * Build the iframe src with URL parameters for auto-configuration.
 */
const iframeSrc = computed(() => {
  if (!playgroundUrl.value || !apiKey.value) return ''
  const url = new URL(playgroundUrl.value)
  url.searchParams.set('apiUrl', apiBaseUrl.value)
  url.searchParams.set('apiKey', apiKey.value)
  url.searchParams.set('model', 'gpt-image-2')
  return url.toString()
})

// --- Computed options for Select components ---

const groupOptions = computed(() =>
  groups.value.map((g) => ({
    value: g.id,
    label: g.name,
    description: g.description,
    rate: g.rate_multiplier,
    subscriptionType: g.subscription_type,
    platform: g.platform,
  }))
)

/** Keys filtered by the currently selected group */
const filteredKeys = computed(() => {
  if (selectedGroupId.value === null) return activeKeys.value
  return activeKeys.value.filter(
    (k) => k.group_id === selectedGroupId.value
  )
})

const keyOptions = computed(() =>
  filteredKeys.value.map((k) => ({
    value: k.id,
    label: k.name || k.key.slice(0, 12) + '…',
  }))
)

// --- Selection helpers ---

function saveSelection() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        groupId: selectedGroupId.value,
        keyId: selectedKeyId.value,
      })
    )
  } catch {
    // ignore storage errors
  }
}

function loadSavedSelection(): { groupId: number | null; keyId: number | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return { groupId: null, keyId: null }
}

/** Apply a key selection: update apiKey ref used by iframe */
function applyKeySelection(keyId: number | null) {
  const key = keyId != null
    ? activeKeys.value.find((k) => k.id === keyId)
    : null
  if (key) {
    apiKey.value = key.key
    hasApiKey.value = true
  } else if (filteredKeys.value.length > 0) {
    // Fallback to first key in current group
    apiKey.value = filteredKeys.value[0].key
    hasApiKey.value = true
  } else {
    hasApiKey.value = false
  }
}

function onGroupChange(val: string | number | boolean | null) {
  const groupId = val as number | null
  selectedGroupId.value = groupId
  // Auto-select first key in the new group
  const firstKey = filteredKeys.value[0]
  selectedKeyId.value = firstKey?.id ?? null
  applyKeySelection(selectedKeyId.value)
  saveSelection()
}

function onKeyChange(val: string | number | boolean | null) {
  const keyId = val as number | null
  selectedKeyId.value = keyId
  applyKeySelection(keyId)
  saveSelection()
}

// --- Data loading ---

async function loadData() {
  loading.value = true
  try {
    // Ensure public settings are loaded
    if (!appStore.publicSettingsLoaded) {
      await appStore.fetchPublicSettings()
    }

    // Fetch available groups & active keys in parallel
    const [availableGroups, keysResult] = await Promise.all([
      userGroupsAPI.getAvailable(),
      keysAPI.list(1, 50, { status: 'active' }),
    ])

    // Only keep groups that allow image generation
    groups.value = availableGroups.filter(
      (g: Group) => g.allow_image_generation === true
    )

    // Only keep active keys that belong to an image-gen group
    const allActiveKeys =
      keysResult.items?.filter((k: ApiKey) => k.status === 'active') ?? []
    activeKeys.value = allActiveKeys.filter(
      (k: ApiKey) =>
        k.group?.allow_image_generation === true ||
        (k.group_id != null &&
          groups.value.some((g) => g.id === k.group_id))
    )

    if (activeKeys.value.length === 0) {
      hasApiKey.value = false
      return
    }

    // Restore saved selection or fallback to first available
    const saved = loadSavedSelection()

    // Validate saved group
    if (
      saved.groupId != null &&
      groups.value.some((g) => g.id === saved.groupId)
    ) {
      selectedGroupId.value = saved.groupId
    } else {
      // Default to first group
      selectedGroupId.value = groups.value[0]?.id ?? null
    }

    // Validate saved key within selected group
    const keysInGroup = activeKeys.value.filter(
      (k) => k.group_id === selectedGroupId.value
    )
    if (
      saved.keyId != null &&
      keysInGroup.some((k) => k.id === saved.keyId)
    ) {
      selectedKeyId.value = saved.keyId
    } else {
      selectedKeyId.value = keysInGroup[0]?.id ?? null
    }

    applyKeySelection(selectedKeyId.value)
  } catch {
    hasApiKey.value = false
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.image-playground-layout {
  @apply flex flex-col;
  height: calc(100vh - 64px - 4rem);
}

.custom-embed-shell {
  @apply relative;
  @apply h-full w-full overflow-hidden;
  @apply bg-gradient-to-b from-gray-50 to-white dark:from-dark-900 dark:to-dark-950;
  @apply p-0;
}

.custom-embed-frame {
  display: block;
  margin: 0;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
}
</style>
