import React, { useState, useContext, useEffect } from "react";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import dataContext from "../Context.js/dataContext";
import classes from "../CreatePost/PostModal/postmodal.module.css";
import Axios from "axios";

const EditUserPostModal = (props) => {
  const context = useContext(dataContext);
  const EditQuestion = context.EditQuestion;
  const [imageSelected, setImageSelected] = useStateWithCallbackLazy(null);
  const [title, settitle] = useState("");
  const [desc, setdesc] = useState("");
  const [tags, settags] = useState(props.tag);
  const [image, setimage] = useState("");
  const [uploaded, setuploaded] = useState(true);
  const [update, forceUpdate] = useState(1);

  useEffect(() => {
    settitle(props.title);
    setdesc(props.description);
    settags(props.tag);
    setImageSelected(props.image);
  }, [props]);
  

  useEffect(() => {
    const formData = new FormData();
    
    formData.append("file", imageSelected);
    formData.append("upload_preset", "mb3hrwz7");

    Axios.post(
      "https://api.cloudinary.com/v1_1/disle0uxb/image/upload",
      formData
    ).then((response) => {
      
      setimage(response.data.url.toString());
      setuploaded(true);
    });
    
  }, [imageSelected]);
  
  

  const uploadImage  =  (file) => {
     setImageSelected(file);
  };
  return (
    <div>
      <div
        class="modal fade"
        id="edit_modal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">
                Edit Post
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <form>
                <div class="mb-3">
                  <input
                    onChange={(e) => {
                      settitle(e.target.value);
                    }}
                    type="text"
                    class="form-control"
                    value={title}
                    // id="exampleInputEmail1"
                    // aria-describedby="emailHelp"
                    placeholder="Enter topic title..."
                  />
                </div>
                <div class="mb-3">
                  <input
                    type="text"
                    class="form-control"
                    id="exampleInputPassword1"
                    placeholder="Tag your topic (e.g. Physics,MCQ) "
                    onChange={(e) => {
                      settags(e.target.value);
                    }}
                    value={tags}
                  />
                </div>
                <div class="mb-3">
                  <textarea
                    onChange={(e) => {
                      setdesc(e.target.value);
                    }}
                    class="form-control"
                    id="exampleFormControlTextarea1"
                    rows="3"
                    placeholder="Write your Question Here.
                    Make sure to Enter 50 characters or more"
                    value={desc}
                  ></textarea>
                </div>

                <div class="mb-3">
                  <label for="formFile" class="form-label">
                    Add an image if you want to:
                  </label>
                  <input
                    onClick={() => {
                      setuploaded(false);
                    }}
                    onChange={(e) => {
                      uploadImage(e.target.files[0]);
                    }}
                    class="form-control"
                    type="file"
                    id="formFile"
                  />
                </div>
                <div>
                  <img height={90} src={image} />
                </div>
                <div className={classes.Rule}>
                  <div
                    class="alert alert-warning alert-dismissible fade show"
                    role="alert"
                  >
                    Do take a moment to read{" "}
                    <strong>Community Guidelines</strong> before posting.
                    <button
                      type="button"
                      class="btn-close"
                      data-bs-dismiss="alert"
                      aria-label="Close"
                    ></button>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              {uploaded ? (
                <button
                  onClick={() => {
                    EditQuestion(title, desc, tags, image, props.id);
                  }}
                  style={{
                    backgroundColor: "#ff922b",
                    color: "white",
                    borderRadius: "8px",
                  }}
                  type="submit"
                  class="btn"
                >
                  Update Question
                </button>
              ) : (
                <p>Please wait for Image Upload</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserPostModal;
