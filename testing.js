async function test() {
  function parallel() {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        console.log("1")
        new Promise(() => {
          setTimeout(() => {
            new Promise(() => {
              setTimeout(() => {
                console.log("3")
                resolve()
              }, 1000)
            })
            console.log("2")
          }, 3000)
        })
      }, 5000)
    })
  }

  function parallel2() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log("2")
        resolve()
      }, 100)
    })
  }

  await parallel()

  console.log("syncronous code")
}
test()
