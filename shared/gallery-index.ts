const getInfo = async () => {
    const res = await fetch('./sketches-info.json')
    return await res.json()
}

getInfo().then((json) => console.log(json))
