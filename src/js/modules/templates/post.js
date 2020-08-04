export default `
<div id="post-{{id}}" class="card upvoted">
   <div class="d-flex flex-row-reverse flex-md-row flex-nowrap justify-content-end">
      <div class="card-header bg-transparent border-0 d-flex flex-row flex-nowrap pl-2 pl-md-0 p-0 mr-md-2">
         <div class="position-relative d-none d-md-block" style="z-index: 3;">
            <a href="{{url}}" target="_blank" rel="nofollow noopener">
            <img src="{{thumb_url}}" class="post-img border-0" alt="">
            </a>
         </div>
         <div class="d-block d-md-none" style="z-index: 3;">
            <a href="{{url}}" rel="nofollow noopener">
            <img src="{{thumb_url}}" class="post-img" alt="link post thumbnail">
            </a>
         </div>
      </div>
      <div class="card-block text-left x-scroll-parent my-md-auto w-100">
         <div style="height: 21px" class="d-block d-md-none mb-1">
            <div class="post-meta text-left x-scroll" style="overflow-x: scroll;"><span class="post-meta-guild"><a href="/+{{guild_name}}">+{{guild_name}}</a> · </span> <span data-toggle="tooltip" data-placement="bottom" data-delay="{&quot;show&quot;:&quot;700&quot;, &quot;hide&quot;:&quot;300&quot;}" title="" data-original-title="{{date}}">{{date}}</span> by <a href="/@{{author}}" class="user-name" target="_blank">{{author}}</a> · ({{host}})</div>
         </div>
         <div class="post-meta text-left d-none d-md-block mb-md-2"><span class="post-meta-guild"><span class="font-weight-bold"><a href="/+{{guild_name}}" class="text-black"><img src="https://i.ruqqus.com/board/90smusic/profile-4.png" class="profile-pic-20 align-top mr-1">+{{guild_name}}</a></span> · </span><span data-toggle="tooltip" data-placement="bottom" data-delay="{&quot;show&quot;:&quot;700&quot;, &quot;hide&quot;:&quot;300&quot;}" title="" data-original-title="{{date}}">{{date}}</span> by <a href="/@{{author}}" class="user-name" target="_blank">{{author}}</a> · ({{host}})</div>
         <h5 class="card-title post-title text-left w-lg-75 mb-0 mb-md-2"><a href="{{permalink}}" class="stretched-link" onclick="if (!window.__cfRLUnblockHandlers) return false; ">{{title}}</a></h5>
         <div class="row post-img-lg mb-3">
            <div class="col px-0">
               <a target="_blank" href="{{permalink}}" rel="nofollow noopener"><img src="{{thumb_url}}" class="img-fluid" alt="post image"></a>
            </div>
         </div>
         <div class="post-actions mt-2 d-none d-md-block">
            <ul class="list-inline text-right d-flex">
               <li class="list-inline-item"><a href="javascript:void(0);" role="button" class="copy-link" data-clipboard-text="https://ruqqus.com{{permalink}}"><i class="fas fa-copy"></i>Copy link</a></li>
            </ul>
         </div>
      </div>
   </div>
   <div class="card-footer d-block d-md-none mt-2">
      <div class="post-actions">
         <ul class="list-inline text-right d-flex">
            <li class="list-inline-item mr-auto"><a href="{{permalink}}"><i class="fas fa-comment-dots"></i>0</a></li>
            <li class="list-inline-item"><a href="javascript:void(0);" role="button" class="copy-link" data-clipboard-text="{{permalink}}"><i class="fas fa-link"></i>Share</a></li>
            <li class="list-inline-item">
               <a href="#" data-toggle="modal" data-target="#actionsModal-{{id}}">
               <i class="fas fa-ellipsis-h"></i>
               </a>
            </li>
            <li id="voting-{{id}}-mobile" class="voting list-inline-item d-md-none">
               <span id="post-{{id}}-up-mobile" tabindex="0" data-id-up="{{id}}" data-content-type="post" class="mr-2 arrow-up upvote-button post-{{id}}-up active">
               </span>
               <span id="post-score-{{id}}-mobile" class="score post-score-{{id}} score-up">5</span>
               <span id="post-{{id}}-down-mobile" tabindex="0" data-id-down="{{id}}" data-content-type="post" class="ml-2 my-0 arrow-down downvote-button post-{{id}}-down ">
               </span>
            </li>
            <li class="list-inline-item"><a href="javascript:void(0)"><i class="fas fa-save"></i> Save</a></li>
         </ul>
      </div>
   </div>
   <div class="modal fade modal-sm-bottom d-md-none" id="actionsModal-{{id}}" tabindex="-1" role="dialog" aria-labelledby="actionsModalTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
         <div class="modal-content">
            <div class="modal-header p-3">
               <h5 class="col modal-title text-center h6">More options</h5>
               <button type="button" class="close position-absolute py-3" style="right: 1rem;" data-dismiss="modal" aria-label="Close">
               <span aria-hidden="true"><i class="fas fa-times-circle text-gray-500"></i></span>
               </button>
            </div>
            <div class="modal-body">
               <ul class="list-group post-actions">
                  <li class="list-group-item d-none"><a href="#" class="d-block"><i class="fas fa-save"></i>Save</a></li>
                  <button class="btn btn-white btn-block btn-lg text-left" data-toggle="modal" data-dismiss="modal" data-target="#deletePostModal" onclick="if (!window.__cfRLUnblockHandlers) return false; delete_postModal('{{id}}')"><i class="far fa-trash-alt text-center text-muted mr-3"></i>Delete</button>
               </ul>
            </div>
         </div>
      </div>
   </div>
</div>
`;
