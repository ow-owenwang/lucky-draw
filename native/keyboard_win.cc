#include <nan.h>
#include <windows.h>

using namespace v8;
using namespace Nan;

// 将字符转换为虚拟键码
BYTE charToVK(char c) {
    // 数字 0-9 的虚拟键码就是 ASCII 值
    if (c >= '0' && c <= '9') {
        return (BYTE)c;
    }
    // 字母 A-Z 的虚拟键码就是大写字母的 ASCII 值
    if (c >= 'a' && c <= 'z') {
        return (BYTE)(c - 32); // 转换为大写
    }
    if (c >= 'A' && c <= 'Z') {
        return (BYTE)c;
    }
    switch (c) {
        case ' ': return VK_SPACE;
        case '\n': case '\r': return VK_RETURN;
        case '\t': return VK_TAB;
        default: return 0;
    }
}

// 检查是否需要 Shift 键
bool needsShift(char c) {
    return (c >= 'A' && c <= 'Z') || 
           c == '!' || c == '@' || c == '#' || c == '$' || c == '%' ||
           c == '^' || c == '&' || c == '*' || c == '(' || c == ')' ||
           c == '_' || c == '+' || c == '{' || c == '}' || c == '|' ||
           c == ':' || c == '"' || c == '<' || c == '>' || c == '?' ||
           c == '~';
}

// 模拟按键按下和释放
void keyPress(BYTE vk, bool shift = false) {
    INPUT inputs[4] = {};
    UINT inputCount = 0;

    // 如果需要 Shift，先按下 Shift
    if (shift) {
        inputs[inputCount].type = INPUT_KEYBOARD;
        inputs[inputCount].ki.wVk = VK_SHIFT;
        inputs[inputCount].ki.dwFlags = 0;
        inputCount++;
    }

    // 按下目标键
    inputs[inputCount].type = INPUT_KEYBOARD;
    inputs[inputCount].ki.wVk = vk;
    inputs[inputCount].ki.dwFlags = 0;
    inputCount++;

    // 释放目标键
    inputs[inputCount].type = INPUT_KEYBOARD;
    inputs[inputCount].ki.wVk = vk;
    inputs[inputCount].ki.dwFlags = KEYEVENTF_KEYUP;
    inputCount++;

    // 如果使用了 Shift，释放 Shift
    if (shift) {
        inputs[inputCount].type = INPUT_KEYBOARD;
        inputs[inputCount].ki.wVk = VK_SHIFT;
        inputs[inputCount].ki.dwFlags = KEYEVENTF_KEYUP;
        inputCount++;
    }

    // 发送输入
    SendInput(inputCount, inputs, sizeof(INPUT));
    
    // 短暂延迟，确保事件被处理
    Sleep(5);
}

// 输入字符串
NAN_METHOD(TypeString) {
    if (info.Length() < 1 || !info[0]->IsString()) {
        return ThrowError("Expected string argument");
    }
    
    Nan::Utf8String str(info[0]);
    const char* text = *str;
    
    for (int i = 0; text[i] != '\0'; i++) {
        char c = text[i];
        
        if (c == '\n' || c == '\r') {
            keyPress(VK_RETURN);
        } else if (c == '\t') {
            keyPress(VK_TAB);
        } else {
            BYTE vk = charToVK(c);
            if (vk != 0) {
                bool shift = needsShift(c);
                keyPress(vk, shift);
            }
        }
        
        // 字符间的延迟，避免系统 key repeat
        Sleep(10);
    }
    
    info.GetReturnValue().Set(Nan::New(true));
}

// 按回车键
NAN_METHOD(PressEnter) {
    keyPress(VK_RETURN);
    info.GetReturnValue().Set(Nan::New(true));
}

// 模块初始化
NAN_MODULE_INIT(Init) {
    Nan::Set(target, 
             Nan::New("typeString").ToLocalChecked(),
             Nan::GetFunction(Nan::New<FunctionTemplate>(TypeString)).ToLocalChecked());
    Nan::Set(target,
             Nan::New("pressEnter").ToLocalChecked(),
             Nan::GetFunction(Nan::New<FunctionTemplate>(PressEnter)).ToLocalChecked());
}

NODE_MODULE(keyboard, Init)

