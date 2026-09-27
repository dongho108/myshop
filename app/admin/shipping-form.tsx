"use client";

import { startTransition, useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ShippingStatus } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { saveShipping } from "./actions";

const options: { value: ShippingStatus; label: string }[] = [
  { value: "preparing", label: "배송 준비 중" },
  { value: "shipping", label: "배송 중" },
  { value: "delivered", label: "배송 완료" },
];

export function ShippingForm({
  orderId,
  shippingStatus,
  trackingNumber,
}: {
  orderId: string;
  shippingStatus: ShippingStatus;
  trackingNumber: string | null;
}) {
  const [state, action, pending] = useActionState(saveShipping, null);
  // 고른 값을 직접 들고 있는다. form action을 쓰면 저장 뒤 화면 값이 초기화돼서 onSubmit으로 보낸다
  const [status, setStatus] = useState(shippingStatus);
  const [tracking, setTracking] = useState(trackingNumber ?? "");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
      className="grid gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-end">
      <input type="hidden" name="orderId" value={orderId} />
      <div className="space-y-1.5">
        <Label htmlFor={`status-${orderId}`} className="text-sm text-muted-foreground">
          배송 상태
        </Label>
        <select
          id={`status-${orderId}`}
          name="shippingStatus"
          value={status}
          onChange={(e) => setStatus(e.target.value as ShippingStatus)}
          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base focus-visible:outline-2 focus-visible:outline-ring"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`tracking-${orderId}`} className="text-sm text-muted-foreground">
          송장번호
        </Label>
        <Input
          id={`tracking-${orderId}`}
          name="trackingNumber"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          inputMode="numeric"
          placeholder="보내고 나서 입력"
          className="h-11 rounded-xl px-3 text-base"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-40"
      >
        {pending ? "저장 중…" : "저장"}
      </button>
      {state && (
        <p
          role="status"
          className={cn(
            "text-sm sm:col-span-3",
            state.ok ? "text-muted-foreground" : "text-destructive",
          )}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
