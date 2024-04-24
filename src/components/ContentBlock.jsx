import { useState } from "react"
import "../../public/css/contentBlock.css"

export default function ContentBlock() {
    const defaultFileText = "No File Selected"
    const resultBlock = document.getElementById("resultBlock")

    const [fileText, setFileText] = useState(defaultFileText)
    const [file, setFile] = useState(null)

    const handleBtnClick = (event) => {
        setFileText(defaultFileText)
        
        const hiddenInput = document.getElementById("actualFileInput")
        hiddenInput.click()

        if (resultBlock !== null) {
            resultBlock.innerHTML = ""
        }
    }
    
    const handleFileChange = (event) => {
        setFile(event.target.files[0])
        setFileText(event.target.files[0].name)
    }
    
    const handleFormSubmit = async (event) => {
        event.preventDefault()
        
        let data = {
            name: file.name,
            path: file.path
        }
        
        scanFile.sendfile(data)
        
        resultBlock.innerHTML = `<img src="img/progress-bar.gif" id="loadingGif" />`

        await window.scanFile.result((event, msg) => {
            if (msg === "nan") {
                resultBlock.innerHTML = `\
                <img src="img/tick.png" class="resImg" />\
                <div class="resSafe">\
                    <span>SAFE</span>\
                    <span>No Ransomware Detected</span>\
                </div>`
            } else {
                resultBlock.innerHTML = `\
                <img src="img/alert.png" class="resImg" />\
                <div class="resUnsafe">\
                    <span>UNSAFE</span>\
                    <span>${msg} Detected</span>\
                </div>`
            }
            console.log(msg);
            // console.log(msg);
            // if(isNaN(msg)){
            //     resultBlock.innerHTML = `\
            //     <div class="resSafe">\
            //         <span>SAFE</span>\
            //         <span>${msg}</span>\
            //     </div>`
            // }
        })
    }
    

    return (
        <div className="contentBlock">
            <div className="header">
                <img src="/img/safenet-upscaled-logo.png" alt="logo" className="logo" />
                <p className="title">SafeNet</p>
            </div>

            <form className="fileInputCard" onSubmit={handleFormSubmit}>
                <p className="chooseFilePrompt">Select the file you want to scan</p>
                <div className="outerBox">
                    <div className="fileInputBox">
                        <input
                            type="file"
                            accept=".acm,.ax,.cpl,.dll,.drv,.efi,.exe,.mui,.ocx,.scr,.sys,.tsp"
                            id="actualFileInput"
                            onChange={handleFileChange}
                            onClick={(event) => {
                                event.target.value = ""
                            }}
                        />
                        <div className="dupFileInput">
                            <div className="btnBox">
                                <button
                                    type="button"
                                    id="dupFileInputBtn"
                                    onClick={handleBtnClick}
                                >Select File</button>
                            </div>
                            <div className="fileTextBox">
                                <span className="fileText">{fileText}</span>
                            </div>
                        </div>
                    </div>
                    <input type="submit" className="scanBtn" value="Scan" />
                </div>
                <div id="resultBlock"></div>
            </form>
        </div>
    )
}