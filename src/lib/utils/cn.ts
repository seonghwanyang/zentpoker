import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 클래스 이름을 합치는 유틸리티 함수
 * 
 * clsx: 조건부 클래스명 처리 및 여러 클래스 합치기
 * twMerge: Tailwind CSS 클래스 충돌 해결 (예: "p-2 p-4" -> "p-4")
 * 
 * @param inputs - 합칠 클래스 이름들
 * @returns 합쳐지고 중복 제거된 클래스 문자열
 * 
 * 예시:
 * cn("text-red-500", "text-blue-500") => "text-blue-500" (나중 값이 우선)
 * cn("p-4", condition && "p-8") => 조건에 따라 "p-4" 또는 "p-8"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
