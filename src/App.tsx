import { useEffect, useState } from "react";

const BACKURL = import.meta.env.VITE_BACKURL

function App() {
  return (
    <Container>
      <Navbar />
      <Files />
    </Container>
  );
}

function Navbar() {
  return (
    <div className="navbar bg-base-200 sticky top-0">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl uppercase peer">
          <i className="bi bi-cloud-fill text-blue-300"></i>
          nube thaba
        </a>
      </div>
    </div>
  );
}
function Files() {
  const [files, setFiles] = useState([]);
  const [isOver, setIsOver] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const refreshFiles = async () => {
    const raw = await fetch(`${BACKURL}/files`);
    const json = await raw.json();
    setFiles(json.data);
  };
  useEffect(() => {
    refreshFiles();
  }, []);
  const toggleOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    setIsOver(!isOver);
    e.preventDefault();
  };
  const drop: React.DragEventHandler<HTMLDivElement> = (e) => {
    setIsOver(false);
    setIsUploading(true);
    const files = e.dataTransfer.files;
    if (files.length > 1) {
      alert("Solo se puede arrastrar un archivo");
      return;
    }
    uploadFile(files);
    e.preventDefault();
  };
  const uploadFile = async (file: FileList) => {
    //create form
    const form = document.createElement("form");
    form.enctype = "multipart/form-data";
    form.method = "post";
    form.action = `${BACKURL}/upload`;
    const input = document.createElement("input");
    input.type = "file";
    input.name = "file";
    input.files = file;
    form.append(input);
    const fd = new FormData(form);

    //http
    const request = new XMLHttpRequest();

    request.upload.addEventListener("progress", (evt) => {
      setUploadPercent(Math.round((evt.loaded / evt.total) * 100));
    });
    request.addEventListener("load", () => {
      setUploadPercent(0);
      setCompleted(true);
      setTimeout(() => {
        setIsUploading(false);
        setCompleted(false);
      }, 1500);
      refreshFiles();
    });

    request.open("post", `${BACKURL}/upload`);
    request.send(fd);
  };
  return (
    <>
      <div
        className={`p-5 grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] grid-rows-[repeat(auto-fill,42px)] gap-2 drag-drop min-h-[calc(100vh-64px)] ${
          isOver ? "dargover" : "dragleave"
        }`}
        onDragOverCapture={toggleOver}
        onDragLeaveCapture={toggleOver}
        onDropCapture={drop}
      >
        {files.map((file) => (
          <div
            key={file}
            className="stat hover:shadow transition-shadow p-1 tooltip border-l-8 border-base-200"
            data-tip={file}
          >
            <div className="stat-value flex items-center justify-between mt-2 mb-2 text-sm">
              <div className="stat-title truncate grow text-start">{file}</div>
              <div className="flex flexrow gap-1">
                <a href={`${BACKURL}/public/uploads/${file}`} download={file}>
                  <i className="bi bi-download cursor-pointer icon-round text-green-500"></i>
                </a>
                <i className="bi bi-trash icon-round text-red-500 transition"></i>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isUploading && <Toast progress={uploadPercent} completed={completed} />}
    </>
  );
}

interface ToastProps {
  progress: number;
  completed: boolean;
}
const Toast = (props: ToastProps) => {
  return (
    <div className="toast toast-end transition">
      <div
        className={`alert transition-all max-w-full w-80 shadow ${
          props.completed ? "alert-success" : null
        }`}
      >
        <h3 className="font-bold text-lg">Subiendo archivo</h3>
        <progress
          className={props.completed ? "hidden" : "progress"}
          value={props.progress}
          max={100}
        ></progress>
      </div>
    </div>
  );
};

function Container(props: React.PropsWithChildren) {
  return <div className="h-screen overflow-y-scroll">{props.children}</div>;
}

export default App;
