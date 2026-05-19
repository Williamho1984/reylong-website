import { supabase } from '../supabase'

export type Event = {
  id: string
  title_en: string
  title_es: string
  date_start: string
  date_end: string
  location: string
  booth_number: string
  description_en: string
  description_es: string
  url: string
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date_end', today)
    .order('date_start', { ascending: true })
  if (error) throw new Error(`Failed to fetch events: ${error.message}`)
  return data ?? []
}

export async function getAllEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date_start', { ascending: false })
  if (error) throw new Error(`Failed to fetch events: ${error.message}`)
  return data ?? []
}
