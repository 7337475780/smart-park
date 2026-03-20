# Software Setup: Programming the ESP32-CAM

To upload the `ESP32_Smart_Parking.ino` code to your ESP32-CAM, you need to use the **Arduino IDE**. Follow these exact steps to download the software and set it up for the ESP32 chip.

## Step 1: Download the Software
1. Go to [https://www.arduino.cc/en/software](https://www.arduino.cc/en/software)
2. Download and install **Arduino IDE 2.x** for Windows.

## Step 2: Add ESP32 Support to Arduino IDE
By default, Arduino IDE only knows how to program standard Arduino boards (like the Uno). You have to explicitly tell it how to speak to ESP32 boards.

1. Open Arduino IDE.
2. Go to **File** > **Preferences** (or press `Ctrl` + `,`).
3. In the text box labeled **"Additional boards manager URLs"**, paste this exact link:
   ```text
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Click **OK**.

## Step 3: Install the ESP32 Board Package
1. On the left sidebar of the Arduino IDE, click the **Boards Manager** icon (it looks like a circuit board).
2. In the search bar, type `esp32`.
3. Look for the package officially created by **"Espressif Systems"**.
4. Click **INSTALL** and wait a few minutes for it to download all the necessary tools.

## Step 4: Select Your Specific Board
Your computer needs to know *which* ESP32 you are using.
1. At the top of the Arduino IDE screen, click the drop-down menu that says "Select Board".
2. Search for and select: **"AI Thinker ESP32-CAM"**. 
   *(Note: If your chip is labeled **"ESP32-S"** or **"32S"**, this is the correct board selection!)*
3. Now, plug your FTDI Programmer (which is connected to the ESP32) into your computer's USB port.
4. Click the "Select Board" drop-down again, and select the **COM Port** that just appeared (e.g., `COM3` or `COM4`).

## Step 5: Upload the Code
1. Open the `ESP32_Smart_Parking.ino` file in the Arduino IDE.
2. Ensure you have changed the Wi-Fi credentials and IP address inside the code.
3. Make sure the physical **IO0 pin is jumpered to GND** on the ESP32-CAM.
4. Press the **Upload** arrow button (`→`) in the top left corner of the Arduino IDE.
5. If you see "Connecting...", follow the **"Flash Sequence"**:
   - **Press and hold** the physical RESET button on the back of the ESP32.
   - **Click** the Upload Arrow in Arduino IDE.
   - When the first "Connecting..." message appears, **release** the RESET button.
6. Wait for it to say **"Done uploading"**!

*(Remember to remove the IO0 jumper wire and press Reset again to actually start running the code!)*

## Troubleshooting: No COM Port Found
If your Arduino IDE says "No port discovered," follow these steps:

### 1. What is "CP2102 Software"?
Wait! It is important to know that **CP2102 doesn't have its own program** that you open like Chrome or Word. 
*   **The "Software" is actually a Driver**: It runs in the background of Windows to create a **COM Port**.
*   **The Program you use to talk to it is Arduino IDE**: This is where you actually write and upload your code.

### 2. Finish the Driver Installation
Since you have already extracted the files, do this:
1. Look for a file named **`CP210xVCPInstaller_x64.exe`** (or just `silabser.inf`).
2. **Double-click the .exe file** to run the installer.
3. Once finished, **Restart your laptop**.

### 2. Manual "Yellow Triangle" Fix
If you see a yellow triangle ⚠️ in Device Manager:
1. Right-click the item with the triangle and select **Update Driver**.
2. Select **"Browse my computer for drivers"**.
3. Click "Browse" and select the **folder** where you extracted the CP2102 files.
4. Click **Next**. Windows should say "Windows has successfully updated your drivers."
5. The triangle should disappear and be replaced by a COM port number (e.g., **COM3**).
