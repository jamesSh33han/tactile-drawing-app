# InTACT Sketchpad Application
### Created by SEED Team 10: JJ Sheehan, Hannah Gonzalez, Owen Brandriss, Ran Bi
- Updated 4/19/2022

This Application was developed to be used in conjunction with the inTACT Tactile Sketchpad created by E.A.S.Y. LLC and Wacom Digitizing Technology. The application allows a tactile image that was drawn on the sketchpad surface to be digitally recorded. The user can manipulate the digital image through included editing commands such as toggling line thickness, mirroring the image, or translating the image. The digital image can be saved and downloaded to the users personal computer, where it can then be shared via the internet or sent to the inTACT Printer, which is able to print the digital image in the original tactile format. Link to inTACT Tactile Sketchpad: https://www.easytactilegraphics.com/

### Installation
To install the application and connect it to your inTACT Tactile Sketchpad, the following software is required:
- Wacom Software Driver (Downloads Available for both Mac and Windows) https://www.wacom.com/en-us/support/product-support/drivers

Once the driver is downloaded and the inTACT sketchpad is connected to your PC via a USB connection, you should see the device listed in the Wacom Driver software. Once this connection has been established, run the inTACT Sketchpad Application. 

### Software Functions
<img width="1788" alt="appOverview" src="https://user-images.githubusercontent.com/73210026/164055537-de956810-5af1-4f5b-af24-01ec23dc088f.png">

- **Load File:** Allows a user to choose a image file on their PC to upload into the drawing application. The file will populate the digital canvas once uploaded and can be digitally edited.
- **Download:** Allows the user to save and download the digital image to their personal computer. Allows images to be saved as .PNG, .JPEG, or .SVG filetypes.
- **Draw:** Allows the user to draw with either the mouse cursor or inTACT sketchpad on the canvas. This button is automatically pre-selected when the application is initialized. 
- **Eraser:** When this button is selected, changes the brush to an eraser. The user is then able to erase any already drawn lines on the canvas based on the current mouse position in the canvas.
- **Delete:** Clears the entire canvas when pressed
- **Toggle Line Thickness:** Toggles the line thickness between three preset modes: Thick (6), Medium (2), and Thin (0.5). Each time the user clicks the Toggle Line Thickness button, the thickness will be changed to the next preset mode.
- **Mirror Image:** Allows the canvas image to be mirrored over both the vertical & horizontal axis. Keeps both the original drawing as well as the new translated drawing on the canvas.
- **Translate Image:** Translates the canvas image to a point specified by the user after selecting the Translate Image button. The original image is removed and is redrawn in the new location.

### API References
- Artyom Voice Recognition: https://docs.ourcodeworld.com/projects/artyom-js
- HTML Canvas: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- Google Material Icon Library: https://fonts.google.com/icons
- The File System Access API: https://web.dev/file-system-access/#what-is-it
