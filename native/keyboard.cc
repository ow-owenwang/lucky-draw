#include <nan.h>
#include <Carbon/Carbon.h>
#include <ApplicationServices/ApplicationServices.h>
#include <unistd.h>

using namespace v8;
using namespace Nan;

// 将字符转换为 macOS 键码
CGKeyCode charToKeyCode(char c) {
    switch (c) {
        case '0': return kVK_ANSI_0;
        case '1': return kVK_ANSI_1;
        case '2': return kVK_ANSI_2;
        case '3': return kVK_ANSI_3;
        case '4': return kVK_ANSI_4;
        case '5': return kVK_ANSI_5;
        case '6': return kVK_ANSI_6;
        case '7': return kVK_ANSI_7;
        case '8': return kVK_ANSI_8;
        case '9': return kVK_ANSI_9;
        case 'a': case 'A': return kVK_ANSI_A;
        case 'b': case 'B': return kVK_ANSI_B;
        case 'c': case 'C': return kVK_ANSI_C;
        case 'd': case 'D': return kVK_ANSI_D;
        case 'e': case 'E': return kVK_ANSI_E;
        case 'f': case 'F': return kVK_ANSI_F;
        case 'g': case 'G': return kVK_ANSI_G;
        case 'h': case 'H': return kVK_ANSI_H;
        case 'i': case 'I': return kVK_ANSI_I;
        case 'j': case 'J': return kVK_ANSI_J;
        case 'k': case 'K': return kVK_ANSI_K;
        case 'l': case 'L': return kVK_ANSI_L;
        case 'm': case 'M': return kVK_ANSI_M;
        case 'n': case 'N': return kVK_ANSI_N;
        case 'o': case 'O': return kVK_ANSI_O;
        case 'p': case 'P': return kVK_ANSI_P;
        case 'q': case 'Q': return kVK_ANSI_Q;
        case 'r': case 'R': return kVK_ANSI_R;
        case 's': case 'S': return kVK_ANSI_S;
        case 't': case 'T': return kVK_ANSI_T;
        case 'u': case 'U': return kVK_ANSI_U;
        case 'v': case 'V': return kVK_ANSI_V;
        case 'w': case 'W': return kVK_ANSI_W;
        case 'x': case 'X': return kVK_ANSI_X;
        case 'y': case 'Y': return kVK_ANSI_Y;
        case 'z': case 'Z': return kVK_ANSI_Z;
        case ' ': return kVK_Space;
        case '\n': case '\r': return kVK_Return;
        case '\t': return kVK_Tab;
        default: return 0;
    }
}

// 模拟按键按下和释放
void keyPress(CGKeyCode keyCode, bool shift = false, bool capsLock = false) {
    // 创建键盘事件
    CGEventRef keyDown = CGEventCreateKeyboardEvent(NULL, keyCode, true);
    CGEventRef keyUp = CGEventCreateKeyboardEvent(NULL, keyCode, false);
    
    // 设置修饰键标志
    CGEventFlags flags = 0;
    if (shift || capsLock) {
        flags |= kCGEventFlagMaskShift;
    }
    
    if (flags != 0) {
        CGEventSetFlags(keyDown, flags);
        CGEventSetFlags(keyUp, flags);
    }
    
    // 发送按键事件
    CGEventPost(kCGHIDEventTap, keyDown);
    usleep(5000); // 5ms 延迟确保按键被处理
    CGEventPost(kCGHIDEventTap, keyUp);
    
    CFRelease(keyDown);
    CFRelease(keyUp);
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
            // 回车键
            keyPress(kVK_Return);
        } else if (c == '\t') {
            // Tab 键
            keyPress(kVK_Tab);
        } else {
            CGKeyCode keyCode = charToKeyCode(c);
            if (keyCode != 0) {
                bool shift = needsShift(c);
                keyPress(keyCode, shift);
            }
        }
        
        // 字符间的延迟，避免系统 key repeat
        // 总计约 10-15ms 延迟，确保每次按键都被正确处理
        usleep(10000);
    }
    
    info.GetReturnValue().Set(Nan::New(true));
}

// 按回车键
NAN_METHOD(PressEnter) {
    keyPress(kVK_Return);
    info.GetReturnValue().Set(Nan::New(true));
}

// 点击指定位置（用于聚焦输入框）
NAN_METHOD(ClickAt) {
    if (info.Length() < 2 || !info[0]->IsNumber() || !info[1]->IsNumber()) {
        return ThrowError("Expected two number arguments: x, y");
    }
    
    double x = Nan::To<double>(info[0]).FromJust();
    double y = Nan::To<double>(info[1]).FromJust();
    
    // 创建鼠标按下事件
    CGEventRef mouseDown = CGEventCreateMouseEvent(
        NULL,
        kCGEventLeftMouseDown,
        CGPointMake(x, y),
        kCGMouseButtonLeft
    );
    
    // 创建鼠标释放事件
    CGEventRef mouseUp = CGEventCreateMouseEvent(
        NULL,
        kCGEventLeftMouseUp,
        CGPointMake(x, y),
        kCGMouseButtonLeft
    );
    
    // 发送鼠标事件
    CGEventPost(kCGHIDEventTap, mouseDown);
    usleep(10000); // 10ms 延迟确保点击被处理
    CGEventPost(kCGHIDEventTap, mouseUp);
    
    CFRelease(mouseDown);
    CFRelease(mouseUp);
    
    info.GetReturnValue().Set(Nan::New(true));
}

// 获取当前鼠标位置
NAN_METHOD(GetMousePos) {
    CGPoint mousePos = CGEventGetLocation(CGEventCreate(NULL));
    Local<Object> pos = Nan::New<Object>();
    Nan::Set(pos, Nan::New("x").ToLocalChecked(), Nan::New(mousePos.x));
    Nan::Set(pos, Nan::New("y").ToLocalChecked(), Nan::New(mousePos.y));
    info.GetReturnValue().Set(pos);
}

// 模块初始化
NAN_MODULE_INIT(Init) {
    Nan::Set(target, 
             Nan::New("typeString").ToLocalChecked(),
             Nan::GetFunction(Nan::New<FunctionTemplate>(TypeString)).ToLocalChecked());
    Nan::Set(target,
             Nan::New("pressEnter").ToLocalChecked(),
             Nan::GetFunction(Nan::New<FunctionTemplate>(PressEnter)).ToLocalChecked());
    Nan::Set(target,
             Nan::New("clickAt").ToLocalChecked(),
             Nan::GetFunction(Nan::New<FunctionTemplate>(ClickAt)).ToLocalChecked());
    Nan::Set(target,
             Nan::New("getMousePos").ToLocalChecked(),
             Nan::GetFunction(Nan::New<FunctionTemplate>(GetMousePos)).ToLocalChecked());
}

NODE_MODULE(keyboard, Init)

