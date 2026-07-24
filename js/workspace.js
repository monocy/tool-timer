const ToolWorkspace = {
  props: {
    settings: { type: Object, required: true },
    translations: { type: Object, required: true }
  },
  template: `
    <div class="w-full glass-panel p-6 sm:p-10 rounded-3xl neon-shadow flex flex-col items-center relative overflow-hidden max-w-xl">
      <!-- Settings Mode -->
      <div v-if="!isRunning && !isPaused && !isFinished" class="w-full flex flex-col items-center py-6">
        <div class="flex gap-2 sm:gap-6 justify-center items-center">
          <!-- Hours -->
          <div class="flex flex-col items-center">
            <span class="text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wider">{{ t('hours') }}</span>
            <div class="flex items-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-1 sm:p-2">
              <button @click="adjust('h', -1)" class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:scale-110 transition-all duration-300">-</button>
              <span class="w-10 sm:w-12 text-center text-xl sm:text-2xl font-bold font-mono-custom">{{ String(hours).padStart(2, '0') }}</span>
              <button @click="adjust('h', 1)" class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:scale-110 transition-all duration-300">+</button>
            </div>
          </div>
          <!-- Divider -->
          <span class="text-xl sm:text-2xl font-bold text-[var(--text-muted)] self-end mb-3 sm:mb-4">:</span>
          <!-- Minutes -->
          <div class="flex flex-col items-center">
            <span class="text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wider">{{ t('minutes') }}</span>
            <div class="flex items-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-1 sm:p-2">
              <button @click="adjust('m', -1)" class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:scale-110 transition-all duration-300">-</button>
              <span class="w-10 sm:w-12 text-center text-xl sm:text-2xl font-bold font-mono-custom">{{ String(minutes).padStart(2, '0') }}</span>
              <button @click="adjust('m', 1)" class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:scale-110 transition-all duration-300">+</button>
            </div>
          </div>
          <!-- Divider -->
          <span class="text-xl sm:text-2xl font-bold text-[var(--text-muted)] self-end mb-3 sm:mb-4">:</span>
          <!-- Seconds -->
          <div class="flex flex-col items-center">
            <span class="text-xs font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wider">{{ t('seconds') }}</span>
            <div class="flex items-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-1 sm:p-2">
              <button @click="adjust('s', -5)" class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:scale-110 transition-all duration-300">-</button>
              <span class="w-10 sm:w-12 text-center text-xl sm:text-2xl font-bold font-mono-custom">{{ String(seconds).padStart(2, '0') }}</span>
              <button @click="adjust('s', 5)" class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:scale-110 transition-all duration-300">+</button>
            </div>
          </div>
        </div>

        <button @click="start" :disabled="totalSecondsSetting === 0"
                class="w-full mt-10 text-[var(--text-main)] font-extrabold py-4 px-6 rounded-2xl hover:brightness-110 hover:-translate-y-1 hover:shadow-xl active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-300"
                :style="{ background: 'linear-gradient(135deg, var(--accent-color), #8b5cf6)', color: settings.theme === 'light' ? '#ffffff' : '#0b0f19', boxShadow: 'var(--accent-glow-intensity)' }">
          {{ t('start_timer') }}
        </button>
      </div>

      <!-- Active Countdown Mode -->
      <div v-else class="w-full flex flex-col items-center py-6">
        <div class="text-5xl sm:text-7xl font-black font-mono-custom tracking-wider tabular-nums leading-none mb-10 select-none transition duration-300"
             :style="{ color: 'var(--accent-color)', textShadow: 'var(--accent-glow-intensity)' }">
          {{ formattedTimeRemaining }}
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-[var(--bg-card)] h-1.5 rounded-full overflow-hidden border border-slate-900/50 mb-10">
          <div class="h-full bg-gradient-to-r from-[var(--accent-color)] to-purple-600 transition-all duration-300"
               :style="{ width: progressPercent + '%', boxShadow: '0 0 10px var(--accent-color)' }"></div>
        </div>

        <!-- Controls -->
        <div class="flex gap-4 w-full">
          <button v-if="isRunning" @click="pause"
                  class="flex-1 bg-[var(--bg-card)] hover:bg-slate-700 hover:-translate-y-1 hover:shadow-xl text-[var(--text-main)] border border-[var(--border-color)] font-bold py-3.5 px-6 rounded-2xl active:scale-95 transition-all duration-300">
            {{ t('pause') }}
          </button>
          <button v-else-if="isPaused" @click="resume"
                  class="flex-1 text-[var(--text-main)] font-extrabold py-3.5 px-6 rounded-2xl active:scale-95 hover:brightness-110 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                  :style="{ background: 'linear-gradient(135deg, var(--accent-color), #8b5cf6)', color: settings.theme === 'light' ? '#ffffff' : '#0b0f19', boxShadow: 'var(--accent-glow-intensity)' }">
            {{ t('resume') }}
          </button>
          <button v-else-if="isFinished" @click="reset"
                  class="flex-1 bg-[var(--bg-card)] hover:bg-slate-700 hover:-translate-y-1 hover:shadow-xl text-[var(--text-main)] border border-[var(--border-color)] font-bold py-3.5 px-6 rounded-2xl active:scale-95 transition-all duration-300">
            {{ t('restart') }}
          </button>

          <button @click="reset"
                  class="px-6 bg-rose-500/10 hover:bg-rose-500/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/20 text-rose-400 border border-rose-500/20 font-bold py-3.5 rounded-2xl active:scale-95 transition-all duration-300">
            {{ t('cancel') }}
          </button>
        </div>
      </div>
    </div>
  `,
  setup(props) {
    const { ref, computed, onUnmounted } = Vue;

    const t = (key, fallback = '') => {
      const parts = key.split('.');
      const currentLang = props.settings.lang;
      const trans = props.translations ? (props.translations.value || props.translations) : {};
      let current = trans[currentLang];
      if (!current) return fallback || key;
      for (const part of parts) {
        current = current[part];
        if (current === undefined) return fallback || key;
      }
      return current;
    };

    const hours = ref(0);
    const minutes = ref(1);
    const seconds = ref(0);

    const isRunning = ref(false);
    const isPaused = ref(false);
    const isFinished = ref(false);

    const timeRemaining = ref(0);
    let timerInterval = null;

    const totalSecondsSetting = computed(() => {
      return hours.value * 3600 + minutes.value * 60 + seconds.value;
    });

    const progressPercent = computed(() => {
      const total = totalSecondsSetting.value;
      if (total === 0) return 0;
      return (timeRemaining.value / total) * 100;
    });

    const formattedTimeRemaining = computed(() => {
      const r = timeRemaining.value;
      const h = Math.floor(r / 3600);
      const m = Math.floor((r % 3600) / 60);
      const s = r % 60;
      
      const hStr = String(h).padStart(2, '0');
      const mStr = String(m).padStart(2, '0');
      const sStr = String(s).padStart(2, '0');
      
      return `${hStr}:${mStr}:${sStr}`;
    });

    const adjust = (type, amt) => {
      if (type === 'h') {
        hours.value = Math.max(0, Math.min(23, hours.value + amt));
      } else if (type === 'm') {
        let newVal = minutes.value + amt;
        if (newVal < 0) newVal = 59;
        else if (newVal > 59) newVal = 0;
        minutes.value = newVal;
      } else if (type === 's') {
        let newVal = seconds.value + amt;
        if (newVal < 0) newVal = 55;
        else if (newVal > 59) newVal = 0;
        seconds.value = newVal;
      }
    };

    const start = () => {
      const total = totalSecondsSetting.value;
      if (total === 0) return;
      
      isFinished.value = false;
      isPaused.value = false;
      isRunning.value = true;
      timeRemaining.value = total;

      timerInterval = setInterval(() => {
        if (timeRemaining.value > 1) {
          timeRemaining.value--;
        } else {
          timeRemaining.value = 0;
          finish();
        }
      }, 1000);
    };

    const pause = () => {
      if (!isRunning.value) return;
      isRunning.value = false;
      isPaused.value = true;
      if (timerInterval) clearInterval(timerInterval);
    };

    const resume = () => {
      if (!isPaused.value) return;
      isPaused.value = false;
      isRunning.value = true;
      
      timerInterval = setInterval(() => {
        if (timeRemaining.value > 1) {
          timeRemaining.value--;
        } else {
          timeRemaining.value = 0;
          finish();
        }
      }, 1000);
    };

    const finish = () => {
      isRunning.value = false;
      isFinished.value = true;
      if (timerInterval) clearInterval(timerInterval);
    };

    const reset = () => {
      isRunning.value = false;
      isPaused.value = false;
      isFinished.value = false;
      timeRemaining.value = 0;
      if (timerInterval) clearInterval(timerInterval);
    };

    onUnmounted(() => {
      if (timerInterval) clearInterval(timerInterval);
    });

    return {
      t,
      hours,
      minutes,
      seconds,
      isRunning,
      isPaused,
      isFinished,
      totalSecondsSetting,
      timeRemaining,
      progressPercent,
      formattedTimeRemaining,
      adjust,
      start,
      pause,
      resume,
      reset
    };
  }
};
