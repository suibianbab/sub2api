<template>
  <AppLayout>
    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ t('pricing.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ t('pricing.description') }}
        </p>
      </div>

      <!-- Toolbar: search + platform tabs -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          v-model="searchQuery"
          :placeholder="t('pricing.searchPlaceholder')"
          class="w-full sm:w-72"
          @search="searchQuery = $event"
        />

        <!-- Platform pill tabs -->
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="tab in platformTabs"
            :key="tab.value"
            class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
            :class="
              platformFilter === tab.value
                ? 'border-primary-500/30 bg-primary-500/10 text-primary-600 dark:text-primary-400'
                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-dark-600 dark:bg-dark-800 dark:text-gray-400 dark:hover:bg-dark-700'
            "
            @click="platformFilter = tab.value"
          >
            {{ tab.label }}
            <span class="text-[10px] opacity-60">{{ tab.count }}</span>
          </button>
        </div>
      </div>

      <!-- Model count -->
      <div class="text-xs text-gray-400 dark:text-gray-500">
        {{ t('pricing.totalModels', { count: filteredModels.length }) }}
      </div>

      <!-- Card grid -->
      <div
        v-if="filteredModels.length"
        class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div
          v-for="model in filteredModels"
          :key="model.name"
          class="rounded-xl border bg-white p-4 transition-shadow hover:shadow-md dark:bg-dark-800"
          :class="[platformBorderClass(model.provider)]"
        >
          <!-- Card header -->
          <div class="mb-3 flex items-start justify-between gap-2">
            <span
              class="truncate font-mono text-sm font-medium text-gray-900 dark:text-white"
              :title="model.name"
            >
              {{ model.name }}
            </span>
            <span
              class="inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase"
              :class="[platformBadgeClass(mapProvider(model.provider))]"
            >
              {{ providerLabel(model.provider) }}
            </span>
          </div>

          <!-- Pricing rows -->
          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-gray-500 dark:text-gray-400">{{ t('pricing.input') }}</span>
              <span class="font-medium tabular-nums text-gray-800 dark:text-gray-200">
                {{ formatUSD(model.inputPerMillion) }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500 dark:text-gray-400">{{ t('pricing.output') }}</span>
              <span class="font-medium tabular-nums text-gray-800 dark:text-gray-200">
                {{ formatUSD(model.outputPerMillion) }}
              </span>
            </div>
            <div
              v-if="model.maxInputTokens"
              class="flex items-center justify-between border-t border-gray-100 pt-2 text-xs dark:border-dark-700"
            >
              <span class="text-gray-400 dark:text-gray-500">Context</span>
              <span class="tabular-nums text-gray-500 dark:text-gray-400">
                {{ formatTokens(model.maxInputTokens) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="py-16 text-center">
        <EmptyState icon="search" :title="t('pricing.empty')" />
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/layout/AppLayout.vue'
import SearchInput from '@/components/common/SearchInput.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { MODEL_PRICES, PROVIDER_LABELS, PROVIDER_ORDER } from '@/data/modelPricing'
import type { ModelPriceEntry } from '@/data/modelPricing'
import { platformBadgeClass, platformBorderClass } from '@/utils/platformColors'

const { t } = useI18n()

const searchQuery = ref('')
const platformFilter = ref('all')

// --- Platform tabs ---
const platformTabs = computed(() => {
  const counts: Record<string, number> = {}
  for (const m of MODEL_PRICES) {
    counts[m.provider] = (counts[m.provider] || 0) + 1
  }
  const sorted = Object.entries(counts).sort(
    (a, b) => (PROVIDER_ORDER[a[0]] ?? 99) - (PROVIDER_ORDER[b[0]] ?? 99)
  )
  return [
    { value: 'all', label: t('pricing.allPlatforms'), count: MODEL_PRICES.length },
    ...sorted.map(([provider, count]) => ({
      value: provider,
      label: PROVIDER_LABELS[provider] || provider,
      count,
    })),
  ]
})

// --- Filtering ---
const filteredModels = computed(() => {
  let result: ModelPriceEntry[] = MODEL_PRICES
  if (platformFilter.value !== 'all') {
    result = result.filter(m => m.provider === platformFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(m => m.name.toLowerCase().includes(q))
  }
  return result
})

// --- Helpers ---
function mapProvider(p: string): string {
  // Map LiteLLM provider names to GroupPlatform for badge colors
  if (p === 'openai' || p === 'text-completion-openai') return 'openai'
  if (p === 'anthropic') return 'anthropic'
  if (p === 'gemini' || p === 'vertex_ai-language-models') return 'gemini'
  return p
}

function providerLabel(p: string): string {
  return PROVIDER_LABELS[p] || p
}

function formatUSD(perMillion: number): string {
  if (!perMillion) return '-'
  if (perMillion < 0.01) return `$${perMillion.toFixed(4)}`
  if (perMillion < 1) return `$${perMillion.toFixed(2)}`
  return `$${parseFloat(perMillion.toPrecision(4))}`
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}M`
  }
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}
</script>
