"""add user password field

Revision ID: add_user_password_field
Revises: c639f6a94062
Create Date: 2025-07-10

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_user_password_field'
down_revision = 'c639f6a94062'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('users', sa.Column('hashed_password', sa.String(), nullable=True))
    # Make it non-nullable after adding column to avoid issues with existing records
    op.execute("UPDATE users SET hashed_password = '' WHERE hashed_password IS NULL")
    op.alter_column('users', 'hashed_password', nullable=False)

def downgrade():
    op.drop_column('users', 'hashed_password')
