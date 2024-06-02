function getReplies(id) {
  fetch('https://micro.blog/conversation.js?format=jsonfeed&url=https%3A%2F%2Fheyloura.com' + id)
  .then(response => response.json())
  .then(conversation => {
	if(conversation.items.length > 0) {
        for(var i = conversation.items.length - 1; i >= 0; i--) {
           var convo = conversation.items[i];
           console.log(convo);
           let author = convo.author.name == 'Loura' ? '' : `<div>
                 <figure class="avatar avatar-lg">
                       <img src="${convo.author.avatar}" loading="lazy" height="48" width="48" /></figure> ${convo.author.name} 
 <a href="#" class="noUnderline">🌐</a></div>`;

         let type = convo.author.name == 'Loura' ? 'mine reply' : 'yours';

           let message = `<div class="${type} messages">
              ${author}
              <div class="message">
                 ${convo.content_html}
                 <small><a href="${convo.url}">${convo.date_published.split('T')[0]}</a></small>
              </div>
           </div>`;

           $('[data-id="'+id+'"]:first').after( message);
        }
    } 
  })
  .catch((error) => {
    // TODO: nothing for now…
    console.log(error);
  });
}
