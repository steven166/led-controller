
var app = paper.app.create("Led Controller", "black", "paperwork_icon");
paper.app.errorHandlers.error = function(jqXHR, textStatus, errorThrown){
  paper.toast(paper.lang.get("Something went wrong"));
};
paper.app.errorHandlers.connectionError = function(jqXHR, textStatus, errorThrown){
  paper.toast(paper.lang.get("Connection Error"));
  return false;
};

// // downloads polling
// setInterval(function(){
//   $.get('/downloads')
//       .done(function(json){
//         lastDownloads = json;
//         callbacks.downloadsUpdated(json);
//       });
// }, 1000);