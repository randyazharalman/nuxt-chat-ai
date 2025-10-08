export function useLLM() {
  const model = useCookie<
  {
    label: string
    icon: string
    company: string
    value: string
    reasoning?: boolean
  }>('llm-model', { default: () => MODELS.find(m => m.value === 'google/gemini-2.5-flash')! })

  return {
    models: MODELS,
    model
  }
}
