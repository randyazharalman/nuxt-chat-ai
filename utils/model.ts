
export const MODELS = [

  {
    label: 'Gemini 2.0 Flash',
    icon: 'i-simple-icons:google',
    company: 'Google',
    value: 'google/gemini-2.0-flash'
  },
  {
    label: 'Gemini 2.5 Flash-Lite',
    icon: 'i-simple-icons:google',
    company: 'Google',
    value: 'google/gemini-2.5-flash-lite'
  },
  {
    label: 'Gemini 2.5 Flash',
    icon: 'i-simple-icons:google',
    company: 'Google',
    value: 'google/gemini-2.5-flash',
    reasoning: true
  },
  {
    label: 'Gemini 2.5 Pro',
    icon: 'i-simple-icons:google',
    company: 'Google',
    value: 'google/gemini-2.5-pro',
    reasoning: true
  },
]

export function isReasoningModel(model: string) {
  return MODELS.find(m => m.value === model)?.reasoning
}
