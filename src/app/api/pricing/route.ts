import { 
  withErrorHandling, 
  createSuccessResponse 
} from '@/lib/api/middleware';
import { getAllPricingPolicies } from '@/lib/config/pricing';

async function handleGetPricing() {
  const pricingPolicies = getAllPricingPolicies();
  
  return createSuccessResponse(pricingPolicies, '가격 정책을 조회했습니다.');
}

export const GET = withErrorHandling(handleGetPricing);