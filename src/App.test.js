import {describe, expect, it, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import App from './App.vue'

vi.mock('@vueuse/sound', () => ({useSound: () => ({play: vi.fn(), stop: vi.fn()})}))

const button = (wrapper, text) => wrapper.findAll('button').find(b => b.text().includes(text))

describe('App', () => {
    it('shows the start screen', () => {
        const wrapper = mount(App)
        expect(button(wrapper, 'Starten')).toBeTruthy()
        expect(wrapper.find('line').exists()).toBe(false)
    })

    it('plays through one round', async () => {
        const wrapper = mount(App)
        await button(wrapper, 'Starten').trigger('click')

        // randomizing: word pair and arrow visible
        expect(wrapper.find('h3').text()).not.toBe('')
        expect(wrapper.find('line').exists()).toBe(true)

        // click skips the spin and reveals the hint
        await wrapper.find('svg').trigger('click')
        expect(wrapper.findAll('g path[fill^="#"]').length).toBeGreaterThan(0)

        // click hides the hint, click again locks the guess
        await wrapper.find('svg').trigger('click')
        expect(wrapper.findAll('g path[fill^="#"]').length).toBe(0)
        await wrapper.find('svg').trigger('click')

        await button(wrapper, 'Aufdecken').trigger('click')
        expect(wrapper.text()).toContain('Lösung:')
        expect(wrapper.text()).toMatch(/[0-4]\s*Punkte/)
        expect(button(wrapper, 'Nächste Runde')).toBeTruthy()
    })
})
