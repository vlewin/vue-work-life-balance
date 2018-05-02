<template>
  <card hcolor="blue-2">
    <i slot="c-header-icon" class="fa fa-clock fa-5x" aria-hidden="true"></i>
    <template slot="c-header-title">
      {{ currentDate.toLocaleDateString("de-DE", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
    </template>

    <div slot="c-body" class="pane" :class="{ open: picker.open }">
      <time-picker :target="picker.target" :init-value="picker.value" v-on:changed="setValue" v-on:close="closePicker"></time-picker>
    </div>

    <date-picker slot="c-body" class="flex flex-center"></date-picker>

    <div slot="c-body" class="flex flex-center container">
      <circle-menu class="flex flex-center relative" :form="form" v-on:open="openPicker"></circle-menu>
    </div>

    <template slot="c-sidebar-title">
      {{ currentDate.toLocaleDateString("de-DE", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
    </template>

    <i slot="c-sidebar-icon" class="fa fa-clock fa-6x" aria-hidden="true"></i>

    <simple-switch slot="c-footer" class="horizontal animated" :active="picker.open">
      <simple-switch slot="up" class="vertical animated" :active="loading">
        <button class="text-white" slot="up" v-on:click="save">
          {{ isRecorded? 'UPDATE' : 'SAVE'}}
        </button>
        <button class="text-white" slot="down" disabled>PLEASE WAIT...</button>
      </simple-switch>
      <button class="text-white" slot="down" :class="{ active: picker.open }" v-on:click="closePicker">CLOSE</button>
    </simple-switch>
  </card>
</template>

<script>
  import { mapState, mapGetters, mapActions } from "vuex"
  import DatePicker from "./DatePicker"
  import TimePicker from "./TimePicker"
  import CircleMenu from "./CircleMenu"

  import Card from "../../shared/ResponsiveCard"
  import SimpleSwitch from "../../shared/SimpleSwitch"

  import differenceInMinutes from "date-fns/difference_in_minutes"
  import format from "date-fns/format"
  import addHours from "date-fns/add_hours"
  import isSameDay from "date-fns/is_same_day"

  import { timeToNumber, timeToDateTime, dateTimeToTime } from "../../../helpers/date"

  export default {
    name: "TimeCard",
    components: {
      Card,
      DatePicker,
      CircleMenu,
      TimePicker,
      SimpleSwitch
    },

    data() {
      return {
        isPortraitMode: true,
        timePicker: false,
        picker: {
          open: false,
          value: null,
          target: 'start'
        },

        form: {
          start: "",
          pause: "",
          finish: ""
        }
      }
    },

    created() {
      this.initForm()
      // FIXME: Move to APP created and save in store
      // window.addEventListener("orientationchange", () => {
      //   if (window.orientation == 90 || window.orientation == -90) {
      //     console.log('Land')
      //     this.isPortraitMode = false
      //   } else {
      //     this.isPortraitMode = true
      //   }
      // })
    },

    watch: {
      "form.start"(val) {
        if (val) {
          console.log("HomePage - start value changed", val)
          this.calculateEnd()
        }
      },

      "form.pause"(val) {
        if (val) {
          console.log("HomePage - pause value changed", val)
          this.calculateEnd()
        }
      },

      "form.finish"(val) {
        if (val) {
          console.log("HomePage - finish value changed", val)
          this.calculateDuration()
        }
      },

      currentDate() {
        console.log("HomePage - currentDate changed", this.currentDate)
        this.initForm()
      },

      currentRecord(oldVal, val) {
        console.log("HomePage - currentRecord changed", oldVal, val)
        this.initRecord()
      }
    },

    computed: {
      ...mapGetters(["currentFomatedDate", "currentWeekNumber", "currentMonthNumber", "currentRecord"]),
      ...mapState(["fetching", "loading", "currentDate", "records", "page"]),

      isRecorded() {
        return !!this.currentRecord
      },

      absence() {
        if (this.isRecorded) {
          return this.currentRecord.absence
        }
      }
    },

    methods: {
      ...mapActions(["navigate"]),

      initRecord() {
        if (this.isRecorded) {
          console.info('isRecorded:', JSON.stringify(this.currentRecord))
          this.$set(this, 'form', this.currentRecord)
        }
      },

      initForm() {
        if (this.isRecorded) {
          console.info('CURRENT:', JSON.stringify(this.currentRecord))
          this.$set(this, 'form', this.currentRecord)
        } else {
          console.info('INIT:', JSON.stringify(this.form))

          this.form = {
            date: this.currentFomatedDate,
            month: this.currentMonthNumber,
            week: this.currentWeekNumber,
            start: dateTimeToTime(new Date()),
            pause: "00:30"
          }
          this.calculateEnd()
        }
      },

      calculateEnd() {
        if(this.isRecorded) {
          console.log('Skip end calculation')
        } else {
          const diff = 8 + timeToNumber(this.form.pause)
          const start = timeToDateTime(this.currentDate, this.form.start)
          const finish = format(addHours(start, diff))

          console.log(start, finish)
          if (isSameDay(start, finish)) {
            this.form.finish = format(addHours(start, diff), "HH:mm")
            console.log(this.form.finish)
          } else {
            this.form.finish = "23:55"
          }
        }

      },

      calculateDuration() {
        console.log("Duration", duration, this.total, "-", timeToNumber(this.form.pause))
        const start = timeToDateTime(this.currentDate, this.form.start)
        const finish = timeToDateTime(this.currentDate, this.form.finish)
        const total = (differenceInMinutes(finish, start) / 60).toFixed(2)
        const duration = total - timeToNumber(this.form.pause)

        console.log("Duration", duration, total, "-", timeToNumber(this.form.pause))

        this.$set(this.form, "duration", duration)
        return duration
      },

      setValue(target, value) {
        console.log("Set Value", target, value)
        this.$set(this.form, target, value)

        if (["start", "pause"].includes(target)) {
          this.calculateEnd()
        }

        this.calculateDuration()
        console.log(JSON.stringify(this.form))
      },

      save: async function() {
        await this.$store.dispatch("saveRecord", this.form)
      },

      openPicker(target) {
        console.log(target)
        this.picker.target = target
        this.picker.value = this.form[target]
        this.picker.open = true
      },

      closePicker() {
        this.picker = this.$options.data().picker
      }
    }
  }
</script>

<style lang="sass" scoped>
  button
    font-weight: bold
    width: 100%
    height: 100%
    font-size: 100%
    background: transparent
    border: none
    outline: none

  .container
    margin: auto


  @media screen and (max-height: 40em) and (orientation:landscape)
    .container
      display: flex
      justify-content: space-around

      .info
        flex-direction: column
        height: auto

        div
          display: flex
          justify-content: center
          align-items: center


  .pane
    height: 100%
    text-align: center
    z-index: 100
    position: absolute
    transform: translateY(100%)
    transition: transform 0.25s
    background: #fff

  @media screen and (orientation: portrait)
    .pane
      width: 100%

    &.open
      transform: translateY(0)
      // height: 100%

    .container
      flex-direction: column

    .content
      width: 100%

    .info
      width: 100%
      height: 10vh

  @media screen and (orientation: landscape)
    .pane
      // width: 70%

    &.open
      transform: translateY(0%)
      // height: 85%

    .content
      width: 70%
      height: 80%


    .info
      flex-direction: column
      width: 30%
      height: 10vh

  .img-responsive
    width: 40%
    height: auto
    transform: rotate(90deg)

  .circle
    height: 5rem
    width: 5rem
    border: 0.5rem solid #ccc
    border-radius: 50%
</style>