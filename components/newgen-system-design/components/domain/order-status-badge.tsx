import React from 'react';

import { cn } from '../../utils/cn';
import { Badge, type BadgeProps } from '../ui/badge';

export enum EOrderStatusType {
  CREATED = 'created',
  SUCCEEDED = 'charge_succeed',
  PENDING = 'payment_pending',
  CHARGE_PENDING = 'charge_pending',
  FAILED = 'payment_failed',
  CHARGE_FAILED = 'charge_failed',
  REFUNDED = 'payment_refunded',
  REFUND_PENDING = 'payment_refund_pending',
  REFUND_FAILED = 'payment_refund_failed',
  REFUND_CANCELED = 'payment_refund_canceled',
  REFUND_REQUIRES_ACTION = 'payment_refund_requires_action',
  DISPUTE_OPEN = 'payment_dispute_open',
  DISPUTE_WON = 'payment_dispute_won',
  DISPUTE_LOST = 'payment_dispute_lost',
  DISPUTE_CANCELED = 'payment_refund_cancelled',
  EVIDENCE_SUBMITTED = 'payment_dispute_evidence_submitted',
  DISPUTE_INQUIRY_OPEN = 'payment_dispute_inquiry_open',
  DISPUTE_INQUIRY_EVIDENCE_SUBMITTED = 'payment_dispute_inquiry_evidence_submitted',
  DISPUTE_INQUIRY_WON = 'payment_dispute_inquiry_won',
  PAYMENT_EXPIRED = 'payment_expired',
  CANCELED = 'payment_canceled',
}

interface StatusMeta {
  label: string;
  variant: NonNullable<BadgeProps['variant']>;
}

export const ORDER_STATUS_META: Record<EOrderStatusType, StatusMeta> = {
  [EOrderStatusType.SUCCEEDED]: { label: 'Succeeded', variant: 'success' },
  [EOrderStatusType.REFUNDED]: { label: 'Refunded', variant: 'secondary' },
  [EOrderStatusType.DISPUTE_WON]: { label: 'Dispute Won', variant: 'success' },
  [EOrderStatusType.DISPUTE_INQUIRY_WON]: { label: 'Inquiry Won', variant: 'success' },

  [EOrderStatusType.PENDING]: { label: 'Pending', variant: 'warning' },
  [EOrderStatusType.CHARGE_PENDING]: { label: 'Charge Pending', variant: 'warning' },
  [EOrderStatusType.REFUND_PENDING]: { label: 'Refund Pending', variant: 'warning' },
  [EOrderStatusType.REFUND_REQUIRES_ACTION]: { label: 'Requires Action', variant: 'warning' },
  [EOrderStatusType.EVIDENCE_SUBMITTED]: { label: 'Evidence Submitted', variant: 'info' },
  [EOrderStatusType.DISPUTE_INQUIRY_EVIDENCE_SUBMITTED]: {
    label: 'Inquiry Evidence',
    variant: 'info',
  },

  [EOrderStatusType.CREATED]: { label: 'Created', variant: 'info' },
  [EOrderStatusType.DISPUTE_OPEN]: { label: 'Dispute Open', variant: 'destructive' },
  [EOrderStatusType.DISPUTE_INQUIRY_OPEN]: { label: 'Inquiry Open', variant: 'warning' },

  [EOrderStatusType.FAILED]: { label: 'Failed', variant: 'destructive' },
  [EOrderStatusType.CHARGE_FAILED]: { label: 'Charge Failed', variant: 'destructive' },
  [EOrderStatusType.REFUND_FAILED]: { label: 'Refund Failed', variant: 'destructive' },
  [EOrderStatusType.DISPUTE_LOST]: { label: 'Dispute Lost', variant: 'destructive' },

  [EOrderStatusType.PAYMENT_EXPIRED]: { label: 'Expired', variant: 'secondary' },
  [EOrderStatusType.CANCELED]: { label: 'Canceled', variant: 'secondary' },
  [EOrderStatusType.REFUND_CANCELED]: { label: 'Refund Canceled', variant: 'secondary' },
  [EOrderStatusType.DISPUTE_CANCELED]: { label: 'Dispute Canceled', variant: 'secondary' },
};

export interface OrderStatusBadgeProps {
  status: EOrderStatusType;
  showDot?: boolean;
  pill?: boolean;
  className?: string;
  dataTestId?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  showDot = true,
  pill = true,
  className,
  dataTestId,
}) => {
  const meta = ORDER_STATUS_META[status];
  if (!meta) return null;

  return (
    <Badge
      variant={meta.variant}
      dot={showDot}
      pill={pill}
      dataTestId={dataTestId}
      className={cn('font-medium', className)}
    >
      {meta.label}
    </Badge>
  );
};

export { OrderStatusBadge as AcCellStatus };
