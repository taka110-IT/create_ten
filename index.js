#!/usr/bin/env node

const { Select } = require('enquirer')
const operators = ['+', '-', '*', '/']

class FourNumbers {
  constructor (min, max) {
    const numbers = []
    for (let i = 0; i < 4; i++) {
      const number = this.getRandomInt(min, max)
      numbers.push(String(number))
    }
    this.numbers = numbers
  }

  getRandomInt (min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
  }
}

class NumberSelector {
  constructor (fourNumbers, selectedNumbers) {
    this.fourNumbers = fourNumbers
    this.fourNumbers.numbers.push('Impossible')
    this.selectedNumbers = selectedNumbers
  }

  async getNumber () {
    let timeRemaining = 20
    const prompt = new Select({
      name: 'numbers',
      message: () => { return `Select a number.  Time Remaining ${timeRemaining} ` },
      choices: this.fourNumbers.numbers
    })

    let interval
    prompt.once('run', () => {
      interval = setInterval(() => {
        timeRemaining -= 1
        timeRemaining <= 0 ? prompt.cancel() : prompt.render()
      }, 1000)
    })
    prompt.once('close', () => { clearInterval(interval) })

    await prompt.run()
      .then(answer => {
        answer === 'Impossible' ? this.selectedNumbers.push(answer) : this.selectedNumbers.push(parseInt(answer))
        this.fourNumbers.numbers.splice(prompt.index, 1)
        if (this.fourNumbers.numbers.length === 2) {
          this.selectedNumbers.push(parseInt(this.fourNumbers.numbers[0].value))
        }
      })
      .catch(() => {
        console.log('\nOh! Time out!')
        this.selectedNumbers.push('Impossible')
      })
  }
}

class OperatorSelector {
  constructor (operators, selectedOperators) {
    this.operators = operators
    this.selectedOperators = selectedOperators
  }

  async getOperator () {
    const prompt = new Select({
      name: 'operators',
      message: 'Select a operator.',
      choices: operators
    })

    try {
      const operator = await prompt.run()
      this.selectedOperators.push(operator)
    } catch (error) {
      console.log(error)
    }
  }
}

class Calculation {
  constructor (selectedNumbers, selectedOperators) {
    this.selectedNumbers = selectedNumbers
    this.selectedOperators = selectedOperators
  }

  total () {
    let midCalculation = 0
    for (let i = 0; i < 3; i++) {
      midCalculation = this.calculate(this.selectedNumbers.splice(0, 2), this.selectedOperators[i])
      this.selectedNumbers.unshift(midCalculation)
    }
    return midCalculation
  }

  calculate (calcNumbers, selectedOperator) {
    switch (selectedOperator) {
      case '+':
        return calcNumbers[0] + calcNumbers[1]
      case '-':
        return calcNumbers[0] - calcNumbers[1]
      case '*':
        return calcNumbers[0] * calcNumbers[1]
      case '/':
        return calcNumbers[0] / calcNumbers[1]
    }
  }
}

class Judgment {
  static judge (total) {
    if (total === 10) {
      console.log(`\nYou created ${total}!`)
      console.log('Success!! Congratulations!!!\n')
    } else {
      if (total !== undefined) console.log(`\nYou created ${total}!`)
      console.log('Let\'s retry!!\n')
    }
  }
}

class Main {
  constructor () {
    const fourNumbers = new FourNumbers(1, 10)
    this.fourNumbers = fourNumbers
  }

  async run () {
    const selectedNumbers = []
    const selectedOperators = []
    const numberSelector = new NumberSelector(this.fourNumbers, selectedNumbers)
    const operatorSelector = new OperatorSelector(operators, selectedOperators)
    for (let i = 0; i < 3; i++) {
      await numberSelector.getNumber()
      if (selectedNumbers.find(element => element === 'Impossible')) break
      await operatorSelector.getOperator()
    }
    if (!(selectedNumbers.find(element => element === 'Impossible'))) {
      console.log(`The remaining numbers ${this.fourNumbers.numbers[0].value}.`)
    }
    const calculation = new Calculation(selectedNumbers, selectedOperators)
    const total = calculation.total()
    Judgment.judge(total)
  }
}

new Main().run()
