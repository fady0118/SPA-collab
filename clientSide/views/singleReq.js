
export default function singleReq(request){
    const singleReqView = document.createElement('div');
    singleReqView.innerHTML = `
    <h1>Single request element</h1>
    <p>${request.topic_title}</p>
    `
    return singleReqView;
}