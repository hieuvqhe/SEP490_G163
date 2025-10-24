import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function InputGroupTextExample() {
  return (
    <form className="flex flex-col items-center gap-5 w-full">
      <div className="grid w-full max-w-3xl grid-cols-1 md:grid-cols-2 gap-5">
        <div className="grid gap-2">
          <Label htmlFor="name">Họ và tên</Label>
          <Input id="name" name="name" type="text" placeholder="Nhập họ và tên" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
      </div>

      <div className="grid w-full max-w-3xl gap-2">
        <Label htmlFor="message">Lời nhắn</Label>
        <Textarea id="message" name="message" placeholder="Nội dung bạn muốn gửi..." rows={5} required />
      </div>

      <Button type="submit" className="mt-2">
        Gửi
      </Button>
    </form>
  );
}
