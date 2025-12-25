import { Request, Response, NextFunction } from 'express';
import { SocialLinkModel } from '../models';
import { AppError, HTTP_STATUS, SUCCESS_MESSAGES } from '@joch/shared';

/**
 * Get all social links (public: only active, admin: all)
 * @route GET /api/social-links
 * @access Public
 */
export const getAllSocialLinks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { all } = req.query;

    // If not admin request, only return active links
    const filter = all === 'true' ? {} : { active: true };

    const links = await SocialLinkModel.find(filter).sort({ order: 1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: links,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single social link by ID
 * @route GET /api/social-links/:id
 * @access Public
 */
export const getSocialLinkById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const link = await SocialLinkModel.findById(req.params.id);

    if (!link) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Social Link nicht gefunden');
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: link,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new social link
 * @route POST /api/social-links
 * @access Private (Admin/Member)
 */
export const createSocialLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { platform, url, label, order, active } = req.body;

    // Get next order number if not provided
    let linkOrder = order;
    if (linkOrder === undefined) {
      const lastLink = await SocialLinkModel.findOne().sort({ order: -1 });
      linkOrder = lastLink ? lastLink.order + 1 : 0;
    }

    const link = await SocialLinkModel.create({
      platform,
      url,
      label,
      order: linkOrder,
      active: active !== undefined ? active : true,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      data: link,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update social link
 * @route PUT /api/social-links/:id
 * @access Private (Admin/Member)
 */
export const updateSocialLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const link = await SocialLinkModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!link) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Social Link nicht gefunden');
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      data: link,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete social link
 * @route DELETE /api/social-links/:id
 * @access Private (Admin/Member)
 */
export const deleteSocialLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const link = await SocialLinkModel.findByIdAndDelete(req.params.id);

    if (!link) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Social Link nicht gefunden');
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.DELETED,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder social links
 * @route PATCH /api/social-links/reorder
 * @access Private (Admin/Member)
 */
export const reorderSocialLinks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'orderedIds muss ein Array sein');
    }

    // Update each link's order
    const updates = orderedIds.map((id: string, index: number) =>
      SocialLinkModel.findByIdAndUpdate(id, { order: index })
    );

    await Promise.all(updates);

    const links = await SocialLinkModel.find().sort({ order: 1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Reihenfolge aktualisiert',
      data: links,
    });
  } catch (error) {
    next(error);
  }
};
