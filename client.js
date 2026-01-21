document.addEventListener("DOMContentLoaded", async function () {
    const formEl = document.getElementById("requestForm");
    formEl.addEventListener("submit", (e)=>{
        e.preventDefault();
        sendRequest()
    })
    async function sendRequest() {
        const formData = new FormData(formEl);
        try {
            const response = await fetch("http://localhost:4000/video-request", {
                method: "POST",
                body: formData,
            })
            const data = await response.json();
            console.log(data)
        } catch (error) {
            console.log(error)
        }
    }
})