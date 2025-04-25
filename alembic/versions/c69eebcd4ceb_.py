"""empty message

Revision ID: c69eebcd4ceb
Revises: 97137483d987, 9fecf593a770
Create Date: 2025-04-22 16:35:43.430817

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c69eebcd4ceb'
down_revision: Union[str, None] = ('97137483d987', '9fecf593a770')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
