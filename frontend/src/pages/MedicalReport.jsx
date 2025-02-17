import { useRef, useState } from "react";
import AuthNavbar from "../components/AuthNavbar";
import { MdAttachFile } from "react-icons/md";
import { RAG_BACKEND_URL } from "../utils/constants";
import Lottie from "lottie-react";
import uploadanimation from "../assets/uploadinganimation.json";
import loadinganimation from "../assets/loading.json";

function MedicalReport() {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [filename, setFileName] = useState("");

  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    // Handle the file input change event
    const file = event.target.files[0];
    setFileName("Uploading");
    // console.log(file);
    if (file) {
      // console.log("Selected file:", file.name);
      // Assuming you're using fetch for API calls, you can update the backend here
      const formData = new FormData();
      formData.append("files", file);
      const metadata = { content: "Medical report" };
      formData.append("metadata", JSON.stringify(metadata));
      try {
        const response = await fetch(`${RAG_BACKEND_URL}/upload/files`, {
          method: "POST",
          body: formData,
          // Add headers if required, e.g., for authentication
        });
        if (!response.ok) {
          throw new Error("Failed to upload file");
        }
        setFileName(`${file.name} uploaded successfully`);
      } catch (error) {
        console.log(error);
        setFileName("Upload Error");
      }
    }
  };

  const fileUploadHandler = () => {
    fileInputRef.current.click();
  };
  const QueryPdfHandler = async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      console.log(e);
      e.preventDefault();
      if (input.trim() !== "") {
        console.log("there -1");
        setLoading(true);
        const newMessages = [...messages, { text: input, sender: "user" }];
        setMessages(newMessages);
        setInput("");
        console.log("before try");
        try {
          const response = await fetch(`${RAG_BACKEND_URL}/get_response`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: input }),
          });
          if (!response.ok) throw new Error("Errror fetching");
          const data = await response.json();
          setLoading(false);
          const newMessages = [
            ...messages,
            { text: input, sender: "user" },
            { text: data?.answer, sender: "bot" }, // right now dummy response,i will get it from ml
          ];
          setMessages(newMessages);
        } catch (error) {
          setLoading(false);
        }
      }
    }
  };
  return (
    <div>
      <AuthNavbar />
      {/* <div className="fixed bottom-10">
        {filename == "Uploading" ? (
          <div className="w-40 ">
            <Lottie animationData={uploadanimation} />
          </div>
        ) : (
          <h2 className="text-lg text-wrap max-w-[70%] mx-auto text-white font-medium">{filename}</h2>
        )}
      </div> */}
      <div className="text-center flex lg:w-full bg-[#282c34] text-white">
        <div className="p-[10px] bg-[#202123] min-w-[14%] min-h-screen relative">
          <div className="absolute bottom-10">
        {filename == "Uploading" ? (
          <div className="w-40 ">
            <Lottie animationData={uploadanimation} />
          </div>
        ) : (
          <h2 className="text-lg w-[90%] text-white font-medium">{filename}</h2>
        )}
        </div>
        </div>
        <section className="flex-1 relative bg-[rgb(52,53,65)] flex flex-col pt-8">
          <div className="flex-1 px-[4rem] mb-24 overflow-y-auto">
            {messages?.map((message, index) => (
              <div
                key={index}
                className={`p-[12px] my-[8px] rounded-md ${
                  message.sender === "user"
                    ? "bg-[#40414f] text-white max-w-4/5 w-fit ml-auto text-right"
                    : " text-white max-w-4/5 w-fit mr-auto text-left"
                }`}
              >
                {message.text}
              </div>
            ))}
            {loading && (
              <div className="w-1/5 mx-auto">
                <Lottie animationData={loadinganimation} />
              </div>
            )}
            {/* {fileName} */}
            {/* <div ref={messagesEndRef} /> */}
          </div>
        </section>
        <div className="fixed bottom-0 right-8 w-4/5 px-[2rem] py-[1rem]">
          {/* <button onClick={queryFromPdfHandler}>Test</button> */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <span
            onClick={fileUploadHandler}
            className="absolute top-7 pl-1 text-2xl cursor-pointer"
          >
            <MdAttachFile />
          </span>
          <textarea
            placeholder="Upload pdf or image then ask questions related to it"
            className="resize-none  bg-[#40414f] py-[12px] px-[3rem] w-full rounded-md border-none outline-none shadow-[0_0_8px_0_rgba(0,0,0,0.25)] text-white font-[1.25em]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={QueryPdfHandler}
            rows={input?.split("\n").length > 5 ? 5 : 1}
          />
          {/* <button
        disabled={file==null}
        className={`absolute right-10 text-2xl cursor-pointer pr-1 top-7`}
        onClick={QueryPdfHandler}
      >
        <BiSend />
      </button> */}
        </div>
      </div>
    </div>
  );
}

export default MedicalReport;
